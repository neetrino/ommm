import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { buildGiftCardDeliveryEmail } from '../mail/templates/gift-card.template';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import { GiftCardsImageService } from './gift-cards-image.service';
import {
  type GiftCardBatchSnapshot,
  giftCardBatchDelegate,
  readBatchAmount,
} from './gift-cards.mapper';

@Injectable()
export class GiftCardsAdminBatchLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly images: GiftCardsImageService,
    private readonly whatsapp: WhatsappNotifyService,
  ) {}

  async assignBatchRecipient(batchId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true, name: true },
    });
    if (!user || user.role !== 'USER') {
      throw new BadRequestException('Recipient user not found');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const batchDelegate = giftCardBatchDelegate(tx);
      const decremented = await batchDelegate.updateMany({
        where: {
          id: batchId,
          status: GiftCardStatus.ACTIVE,
          availableQuantity: { gt: 0 },
        },
        data: { availableQuantity: { decrement: 1 } },
      });
      if (decremented.count !== 1) {
        throw new BadRequestException('Gift card is out of stock or inactive');
      }

      const batch = (await batchDelegate.findUnique({
        where: { id: batchId },
      })) as GiftCardBatchSnapshot | null;
      if (!batch) {
        throw new NotFoundException('Gift card batch not found');
      }

      const createIssuedCardArgs = {
        data: {
          batchId: batch.id,
          code: randomBytes(8).toString('hex').toUpperCase(),
          amountAmd: readBatchAmount(batch),
          balanceAmd: readBatchAmount(batch),
          imageUrl: batch.imageUrl ?? undefined,
          status: GiftCardStatus.ACTIVE,
          purchaserId: batch.purchaserId,
          recipientId: user.id,
          recipientEmail: user.email,
          recipientName: user.name ?? batch.recipientName,
          message: batch.message ?? undefined,
          expiresAt: batch.expiresAt ?? undefined,
        },
      } as unknown as Parameters<typeof tx.giftCard.create>[0];
      const card = await tx.giftCard.create(createIssuedCardArgs);

      await batchDelegate.update({
        where: { id: batch.id },
        data: {
          recipientId: user.id,
          recipientEmail: user.email,
          recipientName: user.name ?? batch.recipientName,
        },
      });
      return card;
    });

    await this.audit.log({
      action: 'GIFT_CARD_ASSIGNED',
      entityType: 'GiftCardBatch',
      entityId: batchId,
      payload: { recipientId: user.id, issuedGiftCardId: created.id },
    });
    await this.sendGiftCardEmail(user.email, created.code);
    return created;
  }

  async deactivateBatch(id: string) {
    const batchDelegate = giftCardBatchDelegate(this.prisma);
    const existing = (await batchDelegate.findUnique({
      where: { id },
    })) as GiftCardBatchSnapshot | null;
    if (!existing) {
      throw new NotFoundException('Gift card batch not found');
    }
    if (existing.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active gift-card batches can be deactivated',
      );
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const txBatchDelegate = giftCardBatchDelegate(tx);
      const batch = await txBatchDelegate.update({
        where: { id },
        data: { status: GiftCardStatus.DEACTIVATED },
      });
      const deactivateCardsArgs = {
        where: { batchId: id, status: GiftCardStatus.ACTIVE },
        data: { status: GiftCardStatus.DEACTIVATED },
      } as unknown as Parameters<typeof tx.giftCard.updateMany>[0];
      await tx.giftCard.updateMany(deactivateCardsArgs);
      return batch;
    });
    await this.audit.log({
      action: 'GIFT_CARD_BATCH_DEACTIVATED',
      entityType: 'GiftCardBatch',
      entityId: id,
    });
    return updated;
  }

  async activateBatch(id: string) {
    const batchDelegate = giftCardBatchDelegate(this.prisma);
    const existing = (await batchDelegate.findUnique({
      where: { id },
    })) as GiftCardBatchSnapshot | null;
    if (!existing) {
      throw new NotFoundException('Gift card batch not found');
    }
    if (existing.status !== GiftCardStatus.DEACTIVATED) {
      throw new BadRequestException(
        'Only deactivated gift-card batches can be activated',
      );
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const txBatchDelegate = giftCardBatchDelegate(tx);
      const batch = await txBatchDelegate.update({
        where: { id },
        data: { status: GiftCardStatus.ACTIVE },
      });
      const activateCardsArgs = {
        where: { batchId: id, status: GiftCardStatus.DEACTIVATED },
        data: { status: GiftCardStatus.ACTIVE },
      } as unknown as Parameters<typeof tx.giftCard.updateMany>[0];
      await tx.giftCard.updateMany(activateCardsArgs);
      return batch;
    });
    await this.audit.log({
      action: 'GIFT_CARD_BATCH_ACTIVATED',
      entityType: 'GiftCardBatch',
      entityId: id,
    });
    return updated;
  }

  async deleteBatch(id: string, actorId: string) {
    const batchDelegate = giftCardBatchDelegate(this.prisma);
    const existing = (await batchDelegate.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
        totalQuantity: true,
        availableQuantity: true,
      },
    })) as Pick<
      GiftCardBatchSnapshot,
      'id' | 'imageUrl' | 'totalQuantity' | 'availableQuantity'
    > | null;
    if (!existing) {
      throw new NotFoundException('Gift card batch not found');
    }
    if (existing.availableQuantity !== existing.totalQuantity) {
      throw new BadRequestException(
        'Cannot delete a batch with issued gift cards. Deactivate it instead.',
      );
    }
    await batchDelegate.delete({ where: { id } });
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: 'GIFT_CARD_BATCH_DELETED',
      entityType: 'GiftCardBatch',
      entityId: id,
    });
    if (existing.imageUrl !== null) {
      await this.images.removeStoredGiftCardImage(existing.imageUrl);
    }
    return { ok: true };
  }

  async resendBatchEmail(id: string) {
    const latest = await this.prisma.giftCard.findFirst({
      where: { batchId: id, recipientEmail: { not: null } },
      orderBy: { createdAt: 'desc' },
    } as unknown as Parameters<typeof this.prisma.giftCard.findFirst>[0]);
    if (!latest?.recipientEmail) {
      throw new BadRequestException('No issued recipient email');
    }
    await this.sendGiftCardEmail(latest.recipientEmail, latest.code);
    return { ok: true };
  }

  async getBatchHistory(batchId: string) {
    const batchDelegate = giftCardBatchDelegate(this.prisma);
    const batch = (await batchDelegate.findUnique({
      where: { id: batchId },
    })) as GiftCardBatchSnapshot | null;
    if (!batch) {
      throw new NotFoundException('Gift card batch not found');
    }
    const issuedCards = await this.prisma.giftCard.findMany({
      where: { batchId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    } as unknown as Parameters<typeof this.prisma.giftCard.findMany>[0]);
    const events = issuedCards.map((card) => ({
      type: card.status === GiftCardStatus.REDEEMED ? 'REDEEMED' : 'ISSUED',
      at: card.updatedAt.toISOString(),
      description:
        card.status === GiftCardStatus.REDEEMED
          ? `Gift card ${card.code} redeemed`
          : `Gift card ${card.code} issued to ${card.recipientName ?? card.recipientEmail ?? 'recipient'}`,
    }));
    return {
      batchId: batch.id,
      status: batch.status,
      amountAmd: batch.amountAmd,
      amountCents: readBatchAmount(batch),
      totalQuantity: batch.totalQuantity,
      availableQuantity: batch.availableQuantity,
      issuedCount: batch.totalQuantity - batch.availableQuantity,
      redeemedCount: issuedCards.filter(
        (card) => card.status === GiftCardStatus.REDEEMED,
      ).length,
      events: [
        {
          type: 'CREATED',
          at: batch.createdAt.toISOString(),
          description: 'Gift-card batch created',
        },
        ...events,
      ],
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
