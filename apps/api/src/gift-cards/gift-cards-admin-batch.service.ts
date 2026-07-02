import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type { Express } from 'express';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';
import type { AdminUpdateGiftCardBatchDto } from './dto/admin-update-gift-card-batch.dto';
import { GiftCardsImageService } from './gift-cards-image.service';
import {
  type GiftCardBatchSnapshot,
  giftCardBatchDelegate,
  readBatchAmount,
  resolveBatchQuantityUpdate,
} from './gift-cards.mapper';

@Injectable()
export class GiftCardsAdminBatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly images: GiftCardsImageService,
  ) {}

  async createAdminCard(
    adminId: string,
    dto: AdminCreateGiftCardDto,
    imageFile?: Express.Multer.File,
  ) {
    const amountAmd = dto.resolvedAmountAmd;
    if (amountAmd === undefined) {
      throw new BadRequestException('amountAmd is required');
    }
    const expiresAt =
      dto.expiresAt !== undefined ? new Date(dto.expiresAt) : undefined;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt date');
    }
    if (!Number.isInteger(dto.quantity) || dto.quantity < 1) {
      throw new BadRequestException('quantity must be a positive integer');
    }
    const recipient =
      dto.recipientId !== undefined
        ? await this.prisma.user.findUnique({
            where: { id: dto.recipientId },
            select: { id: true, role: true, email: true, name: true },
          })
        : null;
    if (
      dto.recipientId !== undefined &&
      (!recipient || recipient.role !== 'USER')
    ) {
      throw new BadRequestException('Recipient user not found');
    }
    const recipientEmail = dto.recipientEmail ?? recipient?.email ?? null;
    const recipientName = dto.recipientName ?? recipient?.name ?? null;
    const uploadedImageUrl =
      imageFile !== undefined
        ? await this.images.storeGiftCardImage(adminId, imageFile)
        : null;
    const imageUrl = uploadedImageUrl ?? dto.imageUrl ?? null;

    try {
      const batchDelegate = giftCardBatchDelegate(this.prisma);
      const batch = (await batchDelegate.create({
        data: {
          amountAmd,
          imageUrl,
          status: GiftCardStatus.ACTIVE,
          totalQuantity: dto.quantity,
          availableQuantity: dto.quantity,
          purchaserId: adminId,
          recipientId: recipient?.id,
          recipientEmail,
          recipientName,
          message: dto.message,
          expiresAt,
        },
      })) as GiftCardBatchSnapshot;
      await this.audit.log({
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'GIFT_CARD_BATCH_CREATED_ADMIN',
        entityType: 'GiftCardBatch',
        entityId: batch.id,
        payload: {
          amountCents: readBatchAmount(batch),
          totalQuantity: batch.totalQuantity,
          recipientEmail: batch.recipientEmail ?? null,
          recipientId: batch.recipientId ?? null,
          imageUrl: batch.imageUrl ?? null,
        },
      });
      return batch;
    } catch (error) {
      if (uploadedImageUrl !== null) {
        await this.images.removeStoredGiftCardImage(uploadedImageUrl);
      }
      throw error;
    }
  }

  async updateBatch(batchId: string, dto: AdminUpdateGiftCardBatchDto) {
    const amountAmd = dto.resolvedAmountAmd;
    if (amountAmd === undefined) {
      throw new BadRequestException('amountAmd is required');
    }
    const existing = (await giftCardBatchDelegate(this.prisma).findUnique({
      where: { id: batchId },
    })) as GiftCardBatchSnapshot | null;
    if (!existing) {
      throw new NotFoundException('Gift card batch not found');
    }

    const parsedExpiresAt =
      dto.expiresAt !== undefined ? new Date(dto.expiresAt) : null;
    if (parsedExpiresAt !== null && Number.isNaN(parsedExpiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt date');
    }

    const recipient =
      dto.recipientId !== undefined
        ? await this.prisma.user.findUnique({
            where: { id: dto.recipientId },
            select: { id: true, role: true, email: true, name: true },
          })
        : null;
    if (
      dto.recipientId !== undefined &&
      (!recipient || recipient.role !== 'USER')
    ) {
      throw new BadRequestException('Recipient user not found');
    }

    const recipientEmail =
      dto.recipientEmail !== undefined
        ? dto.recipientEmail
        : (recipient?.email ?? existing.recipientEmail);
    const recipientName =
      dto.recipientName !== undefined
        ? dto.recipientName
        : (recipient?.name ?? existing.recipientName);
    const nextAmountAmd = amountAmd;
    const amountDiff = nextAmountAmd - readBatchAmount(existing);
    const updateData: Record<string, unknown> = {
      amountAmd: nextAmountAmd,
      recipientId:
        dto.recipientId !== undefined
          ? (recipient?.id ?? null)
          : existing.recipientId,
      recipientEmail,
      recipientName,
      message: dto.message !== undefined ? dto.message : existing.message,
      expiresAt:
        dto.expiresAt !== undefined ? parsedExpiresAt : existing.expiresAt,
    };
    if (dto.quantity !== undefined) {
      const quantityUpdate = resolveBatchQuantityUpdate(
        existing,
        dto.quantity,
      );
      if (quantityUpdate !== null) {
        updateData.totalQuantity = quantityUpdate.totalQuantity;
        updateData.availableQuantity = quantityUpdate.availableQuantity;
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const txBatchDelegate = giftCardBatchDelegate(tx);
      const batch = (await txBatchDelegate.update({
        where: { id: batchId },
        data: updateData,
      })) as GiftCardBatchSnapshot;

      const updateIssuedCardsArgs = {
        where: {
          batchId,
          status: GiftCardStatus.ACTIVE,
        },
        data: {
          amountAmd: nextAmountAmd,
          ...(amountDiff !== 0
            ? { balanceAmd: { increment: amountDiff } }
            : {}),
          recipientId:
            dto.recipientId !== undefined
              ? (recipient?.id ?? null)
              : existing.recipientId,
          recipientEmail,
          recipientName,
          message: dto.message !== undefined ? dto.message : existing.message,
          expiresAt:
            dto.expiresAt !== undefined ? parsedExpiresAt : existing.expiresAt,
        },
      } as unknown as Parameters<typeof tx.giftCard.updateMany>[0];
      await tx.giftCard.updateMany(updateIssuedCardsArgs);

      return batch;
    });

    await this.audit.log({
      action: 'GIFT_CARD_BATCH_UPDATED',
      entityType: 'GiftCardBatch',
      entityId: batchId,
      payload: {
        amountCents: readBatchAmount(updated),
        amountAmd: readBatchAmount(updated),
        totalQuantity: updated.totalQuantity,
        availableQuantity: updated.availableQuantity,
        recipientId: updated.recipientId,
        recipientEmail: updated.recipientEmail,
      },
    });
    return updated;
  }

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
    const web = process.env.WEB_APP_URL ?? 'http://localhost:3000';
    await this.mail.sendEmail({
      to: email,
      subject: 'Your Ommm gift card',
      html: `<p>Code: <strong>${code}</strong></p><p>Redeem at ${web}</p>`,
    });
  }
}
