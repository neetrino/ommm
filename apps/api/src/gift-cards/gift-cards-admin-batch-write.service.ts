import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import type { Express } from 'express';
import { AuditService } from '../audit/audit.service';
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
export class GiftCardsAdminBatchWriteService {
  constructor(
    private readonly prisma: PrismaService,
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
      const quantityUpdate = resolveBatchQuantityUpdate(existing, dto.quantity);
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
}
