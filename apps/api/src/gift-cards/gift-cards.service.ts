import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Express } from 'express';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import type { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';
import type { AdminUpdateGiftCardBatchDto } from './dto/admin-update-gift-card-batch.dto';
import { absolutePathForStoredGiftCardUpload } from './gift-card-upload.helpers';
import {
  ALLOWED_GIFT_CARD_IMAGE_MIMES,
  GIFT_CARD_IMAGE_MIME_TO_EXT,
  normalizeGiftCardImageMime,
} from './gift-card-image.constants';

type GiftCardBatchDelegateLike = {
  findMany: (args: {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    take?: number;
  }) => Promise<Array<Record<string, unknown>>>;
  findUnique: (args: {
    where: { id: string };
    select?: Record<string, boolean>;
  }) => Promise<Record<string, unknown> | null>;
  create: (args: {
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  updateMany: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
  delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
};

type GiftCardBatchSnapshot = {
  id: string;
  amountAmd?: number;
  amountCents?: number;
  imageUrl: string | null;
  status: GiftCardStatus;
  totalQuantity: number;
  availableQuantity: number;
  purchaserId: string;
  recipientId: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class GiftCardsService {
  private readonly logger = new Logger(GiftCardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
    private readonly r2Storage: R2HomeImageStorage,
  ) {}

  private giftCardBatchDelegate(client: unknown): GiftCardBatchDelegateLike {
    return (client as { giftCardBatch: GiftCardBatchDelegateLike })
      .giftCardBatch;
  }

  private get uploadRoot(): string {
    const raw = this.config.get<string>('UPLOAD_DIR');
    if (raw !== undefined && raw.trim() !== '') {
      return raw.trim();
    }
    return join(process.cwd(), 'uploads');
  }

  listMine(userId: string) {
    return this.prisma.giftCard
      .findMany({
        where: { purchaserId: userId },
        include: { batch: { select: { imageUrl: true } } },
        orderBy: { createdAt: 'desc' },
      })
      .then((cards) => cards.map((card) => this.serializeUserGiftCard(card)));
  }

  listReceived(userId: string) {
    return this.prisma.giftCard
      .findMany({
        where: { recipientId: userId },
        include: { batch: { select: { imageUrl: true } } },
        orderBy: { createdAt: 'desc' },
      })
      .then((cards) => cards.map((card) => this.serializeUserGiftCard(card)));
  }

  listMarketBatches() {
    const batchDelegate = this.giftCardBatchDelegate(this.prisma);
    return batchDelegate
      .findMany({
        where: {
          status: GiftCardStatus.ACTIVE,
          availableQuantity: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
      .then((batches) =>
        batches.map((batch) => ({
          ...batch,
          amountAmd: this.readBatchAmount(batch),
          amountCents: this.readBatchAmount(batch),
        })),
      );
  }

  async redeem(userId: string, code: string) {
    const normalized = code.trim().toUpperCase();
    const card = await this.prisma.giftCard.findUnique({
      where: { code: normalized },
    });
    if (!card || card.status !== GiftCardStatus.ACTIVE) {
      throw new NotFoundException('Invalid code');
    }
    const balance = this.readGiftCardBalance(card);
    if (balance <= 0) {
      throw new BadRequestException('Gift card has no balance');
    }
    const amount = balance;
    const redeemCardUpdateArgs = {
      where: { id: card.id },
      data: {
        balanceAmd: 0,
        status: GiftCardStatus.REDEEMED,
        recipientId: userId,
      },
    } as unknown as Parameters<typeof this.prisma.giftCard.update>[0];
    await this.prisma.$transaction([
      this.prisma.giftCard.update(redeemCardUpdateArgs),
      this.prisma.user.update({
        where: { id: userId },
        data: { giftCreditsCents: { increment: amount } },
      }),
    ]);
    return { ok: true, creditedCents: amount };
  }

  listAdmin() {
    return this.prisma.giftCard
      .findMany({
        include: {
          purchaser: { select: { email: true, name: true } },
          recipient: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      .then((cards) =>
        cards.map((card) => ({
          ...card,
          amountAmd: this.readGiftCardAmount(card),
          balanceAmd: this.readGiftCardBalance(card),
          amountCents: this.readGiftCardAmount(card),
          balanceCents: this.readGiftCardBalance(card),
        })),
      );
  }

  listAdminBoard() {
    return this.loadAdminBoardWithFallback().then((batches) =>
      batches.map((batch) => ({
        ...batch,
        amountAmd: this.readBatchAmount(batch),
        amountCents: this.readBatchAmount(batch),
      })),
    );
  }

  private async loadAdminBoardWithFallback() {
    try {
      const batchDelegate = this.giftCardBatchDelegate(this.prisma);
      return await batchDelegate.findMany({
        include: {
          purchaser: { select: { email: true, name: true } },
          recipient: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
    } catch (error) {
      if (
        !(error instanceof PrismaClientKnownRequestError) ||
        error.code !== 'P2021'
      ) {
        throw error;
      }
      this.logger.warn(
        'GiftCardBatch table is missing; falling back to grouped GiftCard board response.',
      );
      const cards = await this.prisma.giftCard.findMany({
        include: {
          purchaser: { select: { email: true, name: true } },
          recipient: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
      const grouped = new Map<
        string,
        {
          id: string;
          amountAmd: number;
          imageUrl: string | null;
          status: GiftCardStatus;
          totalQuantity: number;
          availableQuantity: number;
          recipientEmail: string | null;
          recipientName: string | null;
          message: string | null;
          expiresAt: Date | null;
          createdAt: Date;
          purchaser: { email: string; name: string | null };
          recipient: { email: string; name: string | null } | null;
        }
      >();

      for (const card of cards) {
        const key = [
          this.readGiftCardAmount(card),
          this.readGiftCardImage(card),
          card.status,
          card.purchaserId,
          card.recipientId ?? '',
          card.recipientEmail ?? '',
          card.recipientName ?? '',
          card.message ?? '',
          card.expiresAt?.toISOString() ?? '',
        ].join('|');
        const existing = grouped.get(key);
        const isAvailable =
          card.status === GiftCardStatus.ACTIVE &&
          this.readGiftCardBalance(card) > 0
            ? 1
            : 0;
        if (!existing) {
          grouped.set(key, {
            id: card.id,
            amountAmd: this.readGiftCardAmount(card),
            imageUrl: this.readGiftCardImage(card),
            status: card.status,
            totalQuantity: 1,
            availableQuantity: isAvailable,
            recipientEmail: card.recipientEmail ?? null,
            recipientName: card.recipientName ?? null,
            message: card.message ?? null,
            expiresAt: card.expiresAt ?? null,
            createdAt: card.createdAt,
            purchaser: card.purchaser,
            recipient: card.recipient,
          });
          continue;
        }
        existing.totalQuantity += 1;
        existing.availableQuantity += isAvailable;
        if (card.createdAt > existing.createdAt) {
          existing.createdAt = card.createdAt;
        }
      }

      return [...grouped.values()].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }
  }

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
        ? await this.storeGiftCardImage(adminId, imageFile)
        : null;
    const imageUrl = uploadedImageUrl ?? dto.imageUrl ?? null;

    try {
      const batchDelegate = this.giftCardBatchDelegate(this.prisma);
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
          amountCents: this.readBatchAmount(batch),
          totalQuantity: batch.totalQuantity,
          recipientEmail: batch.recipientEmail ?? null,
          recipientId: batch.recipientId ?? null,
          imageUrl: batch.imageUrl ?? null,
        },
      });
      return batch;
    } catch (error) {
      if (uploadedImageUrl !== null) {
        await this.removeStoredGiftCardImage(uploadedImageUrl);
      }
      throw error;
    }
  }

  async updateBatch(batchId: string, dto: AdminUpdateGiftCardBatchDto) {
    const amountAmd = dto.resolvedAmountAmd;
    if (amountAmd === undefined) {
      throw new BadRequestException('amountAmd is required');
    }
    const existing = (await this.giftCardBatchDelegate(this.prisma).findUnique({
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
    const amountDiff = nextAmountAmd - this.readBatchAmount(existing);
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
      const quantityUpdate = this.resolveBatchQuantityUpdate(
        existing,
        dto.quantity,
      );
      if (quantityUpdate !== null) {
        updateData.totalQuantity = quantityUpdate.totalQuantity;
        updateData.availableQuantity = quantityUpdate.availableQuantity;
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const txBatchDelegate = this.giftCardBatchDelegate(tx);
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
        amountCents: this.readBatchAmount(updated),
        amountAmd: this.readBatchAmount(updated),
        totalQuantity: updated.totalQuantity,
        availableQuantity: updated.availableQuantity,
        recipientId: updated.recipientId,
        recipientEmail: updated.recipientEmail,
      },
    });
    return updated;
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

  async assignBatchRecipient(batchId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true, name: true },
    });
    if (!user || user.role !== 'USER') {
      throw new BadRequestException('Recipient user not found');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const batchDelegate = this.giftCardBatchDelegate(tx);
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
          amountAmd: this.readBatchAmount(batch),
          balanceAmd: this.readBatchAmount(batch),
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
    const batchDelegate = this.giftCardBatchDelegate(this.prisma);
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
      const txBatchDelegate = this.giftCardBatchDelegate(tx);
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
    const batchDelegate = this.giftCardBatchDelegate(this.prisma);
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
      const txBatchDelegate = this.giftCardBatchDelegate(tx);
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
    const batchDelegate = this.giftCardBatchDelegate(this.prisma);
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
      await this.removeStoredGiftCardImage(existing.imageUrl);
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
    const batchDelegate = this.giftCardBatchDelegate(this.prisma);
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
      amountCents: this.readBatchAmount(batch),
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
    const events: Array<{
      type: 'CREATED' | 'ASSIGNED' | 'REDEEMED' | 'DEACTIVATED';
      at: string;
      description: string;
    }> = [
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
    return {
      cardId: card.id,
      status: card.status,
      amountCents: this.readGiftCardAmount(card),
      balanceCents: this.readGiftCardBalance(card),
      amountAmd: this.readGiftCardAmount(card),
      balanceAmd: this.readGiftCardBalance(card),
      events,
      note: 'Detailed redemption ledger is not stored yet; timeline shows available gift-card activity.',
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

  private assertGiftCardImageBuffer(file: Express.Multer.File): {
    buffer: Buffer;
    mime: string;
  } {
    const mime = normalizeGiftCardImageMime(file.mimetype);
    if (!ALLOWED_GIFT_CARD_IMAGE_MIMES.has(mime)) {
      throw new BadRequestException(
        'Only JPG, JPEG, PNG, or WEBP images are allowed',
      );
    }
    if (!GIFT_CARD_IMAGE_MIME_TO_EXT[mime]) {
      throw new BadRequestException('Invalid image type');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    return { buffer: file.buffer, mime };
  }

  private async storeGiftCardImage(
    adminId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const { buffer, mime } = this.assertGiftCardImageBuffer(file);
    const ext = GIFT_CARD_IMAGE_MIME_TO_EXT[mime];
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    if (this.r2Storage.isConfigured()) {
      const key = `gift-cards/${adminId}/${filename}`;
      return this.r2Storage.putObject({
        key,
        body: buffer,
        contentType: mime,
      });
    }
    const dir = join(this.uploadRoot, 'gift-cards', adminId);
    await mkdir(dir, { recursive: true });
    const diskPath = join(dir, filename);
    await writeFile(diskPath, buffer);
    return `/v1/uploads/gift-cards/${adminId}/${filename}`;
  }

  private async removeStoredGiftCardImage(stored: string): Promise<void> {
    if (stored.startsWith('http://') || stored.startsWith('https://')) {
      await this.r2Storage.deleteObjectIfOwned(stored);
      return;
    }
    const absolute = absolutePathForStoredGiftCardUpload(
      this.uploadRoot,
      stored,
    );
    if (!absolute) {
      return;
    }
    try {
      await unlink(absolute);
    } catch (error) {
      this.logger.warn(
        `Could not remove uploaded gift-card image (${stored}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private resolveBatchQuantityUpdate(
    existing: Pick<
      GiftCardBatchSnapshot,
      'totalQuantity' | 'availableQuantity'
    >,
    nextQuantity: number,
  ): Pick<GiftCardBatchSnapshot, 'totalQuantity' | 'availableQuantity'> | null {
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      throw new BadRequestException('quantity must be a positive integer');
    }
    if (nextQuantity === existing.totalQuantity) {
      return null;
    }
    const issuedCount = existing.totalQuantity - existing.availableQuantity;
    if (nextQuantity < issuedCount) {
      throw new BadRequestException(
        `quantity cannot be less than the number of issued cards (${issuedCount})`,
      );
    }
    return {
      totalQuantity: nextQuantity,
      availableQuantity: nextQuantity - issuedCount,
    };
  }

  private readGiftCardAmount(card: unknown): number {
    const row = card as Record<string, unknown>;
    const amountAmd = row.amountAmd;
    if (typeof amountAmd === 'number') {
      return amountAmd;
    }
    const amountCents = row.amountCents;
    return typeof amountCents === 'number' ? amountCents : 0;
  }

  private readGiftCardBalance(card: unknown): number {
    const row = card as Record<string, unknown>;
    const balanceAmd = row.balanceAmd;
    if (typeof balanceAmd === 'number') {
      return balanceAmd;
    }
    const balanceCents = row.balanceCents;
    return typeof balanceCents === 'number' ? balanceCents : 0;
  }

  private readGiftCardImage(card: unknown): string | null {
    const imageUrl = (card as Record<string, unknown>).imageUrl;
    return typeof imageUrl === 'string' ? imageUrl : null;
  }

  private serializeUserGiftCard(card: {
    id: string;
    code: string;
    status: GiftCardStatus;
    recipientEmail: string | null;
    recipientName: string | null;
    message: string | null;
    expiresAt: Date | null;
    createdAt: Date;
    batch?: { imageUrl: string | null } | null;
  }) {
    return {
      id: card.id,
      code: card.code,
      amountCents: this.readGiftCardAmount(card),
      balanceCents: this.readGiftCardBalance(card),
      status: card.status,
      imageUrl: this.readGiftCardImage(card) ?? card.batch?.imageUrl ?? null,
      recipientEmail: card.recipientEmail,
      recipientName: card.recipientName,
      message: card.message,
      expiresAt: card.expiresAt,
      createdAt: card.createdAt,
    };
  }

  private readBatchAmount(batch: unknown): number {
    const row = batch as Record<string, unknown>;
    const amountAmd = row.amountAmd;
    if (typeof amountAmd === 'number') {
      return amountAmd;
    }
    const amountCents = row.amountCents;
    return typeof amountCents === 'number' ? amountCents : 0;
  }
}
