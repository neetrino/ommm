import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GiftCardStatus, GiftCardTransactionKind } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { giftCardCsv } from './gift-card-issue';
import { readGiftCardBalance } from './gift-cards.mapper';

@Injectable()
export class GiftCardsAdminCardOpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async extendExpiry(id: string, expiresAtIso: string) {
    const expiresAt = new Date(expiresAtIso);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new BadRequestException('expiresAt must be a future date');
    }
    const card = await this.requireCard(id);
    const data = {
      expiresAt,
      ...(card.status === GiftCardStatus.EXPIRED && this.hasBalance(card)
        ? { status: GiftCardStatus.ACTIVE }
        : {}),
    };
    const updated = await this.prisma.giftCard.update({ where: { id }, data });
    await this.audit.log({
      action: 'GIFT_CARD_EXPIRY_EXTENDED',
      entityType: 'GiftCard',
      entityId: id,
      payload: { expiresAt: expiresAt.toISOString() },
    });
    return updated;
  }

  async adjustBalance(
    id: string,
    input: { balanceAmd?: number; balanceClasses?: number },
    actorId: string,
  ) {
    if (input.balanceAmd === undefined && input.balanceClasses === undefined) {
      throw new BadRequestException('A balance is required');
    }
    const card = await this.requireCard(id);
    const balanceAmd = input.balanceAmd ?? readGiftCardBalance(card);
    const balanceClasses = input.balanceClasses ?? card.balanceClasses;
    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.giftCard.update({
        where: { id },
        data: {
          balanceAmd,
          balanceClasses,
          status: this.statusAfterAdjust(card.status, balanceAmd, balanceClasses),
        },
      });
      await tx.giftCardTransaction.create({
        data: {
          giftCardId: id,
          kind: GiftCardTransactionKind.ADJUST,
          userId: actorId,
          amountAmd: balanceAmd - readGiftCardBalance(card),
          classes: balanceClasses - card.balanceClasses,
          balanceAmdAfter: balanceAmd,
          balanceClassesAfter: balanceClasses,
        },
      });
      return next;
    });
    await this.audit.log({
      actorId,
      action: 'GIFT_CARD_BALANCE_ADJUSTED',
      entityType: 'GiftCard',
      entityId: id,
      payload: { balanceAmd, balanceClasses },
    });
    return updated;
  }

  async exportBatchCsv(batchId: string): Promise<string> {
    const batch = await this.prisma.giftCardBatch.findUnique({
      where: { id: batchId },
      select: { id: true },
    });
    if (batch === null) {
      throw new NotFoundException('Gift card batch not found');
    }
    const cards = await this.prisma.giftCard.findMany({
      where: { batchId },
      orderBy: { createdAt: 'asc' },
      select: {
        code: true,
        status: true,
        balanceAmd: true,
        balanceClasses: true,
        recipientEmail: true,
        redeemedAt: true,
        expiresAt: true,
      },
    });
    return giftCardCsv(cards);
  }

  private async requireCard(id: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { id } });
    if (card === null) {
      throw new NotFoundException('Gift card not found');
    }
    return card;
  }

  private hasBalance(card: { balanceAmd: number; balanceClasses: number }): boolean {
    return readGiftCardBalance(card) > 0 || card.balanceClasses > 0;
  }

  private statusAfterAdjust(
    status: GiftCardStatus,
    balanceAmd: number,
    balanceClasses: number,
  ): GiftCardStatus {
    if (status === GiftCardStatus.DEACTIVATED || status === GiftCardStatus.EXPIRED) {
      return status;
    }
    return balanceAmd === 0 && balanceClasses === 0
      ? GiftCardStatus.REDEEMED
      : GiftCardStatus.ACTIVE;
  }
}
