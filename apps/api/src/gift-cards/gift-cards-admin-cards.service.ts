import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { buildGiftCardDeliveryEmail } from '../mail/templates/gift-card.template';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import { readGiftCardAmount, readGiftCardBalance } from './gift-cards.mapper';

@Injectable()
export class GiftCardsAdminCardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly whatsapp: WhatsappNotifyService,
  ) {}

  listAssignableUsers() {
    return this.prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, email: true, name: true, lastName: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async deactivate(id: string) {
    const existing = await this.prisma.giftCard.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Gift card not found');
    }
    if (existing.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active gift cards can be deactivated',
      );
    }
    const updated = await this.prisma.giftCard.update({
      where: { id },
      data: { status: GiftCardStatus.DEACTIVATED },
    });
    await this.audit.log({
      action: 'GIFT_CARD_DEACTIVATED',
      entityType: 'GiftCard',
      entityId: id,
    });
    return updated;
  }

  async deleteAdminCard(id: string, actorId: string) {
    const existing = await this.prisma.giftCard.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Gift card not found');
    }

    await this.prisma.giftCard.delete({ where: { id } });
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: 'GIFT_CARD_DELETED',
      entityType: 'GiftCard',
      entityId: id,
    });

    return { ok: true };
  }

  async resendEmail(id: string) {
    const card = await this.prisma.giftCard.findUnique({
      where: { id },
      include: { recipient: { select: { email: true } } },
    });
    if (!card?.recipientEmail) {
      if (card?.recipient?.email) {
        await this.sendGiftCardEmail(card.recipient.email, card.code);
        return { ok: true };
      }
      throw new BadRequestException('No recipient email');
    }
    await this.sendGiftCardEmail(card.recipientEmail, card.code);
    return { ok: true };
  }

  async assignRecipient(giftCardId: string, userId: string) {
    const card = await this.prisma.giftCard.findUnique({
      where: { id: giftCardId },
    });
    if (!card) {
      throw new NotFoundException('Gift card not found');
    }
    if (card.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException('Only active gift cards can be assigned');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true, name: true },
    });
    if (!user || user.role !== 'USER') {
      throw new BadRequestException('Recipient user not found');
    }

    const updated = await this.prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        recipientId: user.id,
        recipientEmail: user.email,
        recipientName: user.name ?? card.recipientName,
      },
      include: {
        purchaser: { select: { email: true, name: true } },
        recipient: { select: { email: true, name: true } },
      },
    });
    await this.audit.log({
      action: 'GIFT_CARD_ASSIGNED',
      entityType: 'GiftCard',
      entityId: giftCardId,
      payload: { recipientId: user.id },
    });
    return updated;
  }

  async getRedemptionHistory(giftCardId: string) {
    const card = await this.prisma.giftCard.findUnique({
      where: { id: giftCardId },
      include: {
        recipient: { select: { id: true, email: true, name: true } },
      },
    });
    if (!card) {
      throw new NotFoundException('Gift card not found');
    }
    const ledger = await this.prisma.giftCardTransaction.findMany({
      where: { giftCardId },
      orderBy: { createdAt: 'asc' },
    });
    if (ledger.length > 0) {
      return {
        cardId: card.id,
        status: card.status,
        amountCents: readGiftCardAmount(card),
        balanceCents: readGiftCardBalance(card),
        amountAmd: readGiftCardAmount(card),
        balanceAmd: readGiftCardBalance(card),
        balanceClasses: card.balanceClasses,
        redeemedAt: card.redeemedAt,
        events: ledger.map((row) => ({
          type: row.kind,
          at: row.createdAt.toISOString(),
          description: ledgerDescription(row),
          orderId: row.orderId,
          amountAmd: row.amountAmd,
          classes: row.classes,
          balanceAmdAfter: row.balanceAmdAfter,
          balanceClassesAfter: row.balanceClassesAfter,
        })),
      };
    }
    return {
      cardId: card.id,
      status: card.status,
      amountCents: readGiftCardAmount(card),
      balanceCents: readGiftCardBalance(card),
      amountAmd: readGiftCardAmount(card),
      balanceAmd: readGiftCardBalance(card),
      events: legacyGiftCardEvents(card),
      note: 'Detailed redemption ledger is not stored yet; timeline shows available gift-card activity.',
    };
  }

  private async sendGiftCardEmail(email: string, code: string) {
    await this.mail.sendEmail({
      to: email,
      ...buildGiftCardDeliveryEmail({
        code,
        webAppUrl: process.env.WEB_APP_URL,
      }),
    });
    await this.whatsapp.trySendGiftCard(email, code);
  }
}

function ledgerDescription(row: {
  kind: string;
  amountAmd: number;
  classes: number;
  balanceAmdAfter: number;
  balanceClassesAfter: number;
}): string {
  const moved =
    row.classes > 0 ? `${row.classes} classes` : `${row.amountAmd} AMD`;
  return `${row.kind}: ${moved}; balance ${row.balanceAmdAfter} AMD / ${row.balanceClassesAfter} classes`;
}

function legacyGiftCardEvents(card: {
  createdAt: Date;
  updatedAt: Date;
  status: GiftCardStatus;
  recipientId: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  recipient: { name: string | null; email: string | null } | null;
}): Array<{ type: string; at: string; description: string }> {
  const events = [
    {
      type: 'CREATED',
      at: card.createdAt.toISOString(),
      description: 'Gift card created',
    },
  ];
  if (card.recipientId || card.recipientEmail) {
    const label =
      card.recipient?.name ??
      card.recipient?.email ??
      card.recipientName ??
      card.recipientEmail ??
      'recipient';
    events.push({
      type: 'ASSIGNED',
      at: card.updatedAt.toISOString(),
      description: `Assigned to ${label}`,
    });
  }
  if (card.status === GiftCardStatus.REDEEMED) {
    events.push({
      type: 'REDEEMED',
      at: card.updatedAt.toISOString(),
      description: 'Gift card redeemed',
    });
  }
  if (card.status === GiftCardStatus.DEACTIVATED) {
    events.push({
      type: 'DEACTIVATED',
      at: card.updatedAt.toISOString(),
      description: 'Gift card deactivated',
    });
  }
  return events;
}
