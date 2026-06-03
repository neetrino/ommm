import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus, Prisma } from '@prisma/client';
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
import { absolutePathForStoredGiftCardUpload } from './gift-card-upload.helpers';
import {
  ALLOWED_GIFT_CARD_IMAGE_MIMES,
  GIFT_CARD_IMAGE_MIME_TO_EXT,
  normalizeGiftCardImageMime,
} from './gift-card-image.constants';

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

  private get uploadRoot(): string {
    const raw = this.config.get<string>('UPLOAD_DIR');
    if (raw !== undefined && raw.trim() !== '') {
      return raw.trim();
    }
    return join(process.cwd(), 'uploads');
  }

  listMine(userId: string) {
    return this.prisma.giftCard.findMany({
      where: { purchaserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listReceived(userId: string) {
    return this.prisma.giftCard.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async redeem(userId: string, code: string) {
    const normalized = code.trim().toUpperCase();
    const card = await this.prisma.giftCard.findUnique({
      where: { code: normalized },
    });
    if (!card || card.status !== GiftCardStatus.ACTIVE) {
      throw new NotFoundException('Invalid code');
    }
    if (card.balanceCents <= 0) {
      throw new BadRequestException('Gift card has no balance');
    }
    const amount = card.balanceCents;
    await this.prisma.$transaction([
      this.prisma.giftCard.update({
        where: { id: card.id },
        data: {
          balanceCents: 0,
          status: GiftCardStatus.REDEEMED,
          recipientId: userId,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { giftCreditsCents: { increment: amount } },
      }),
    ]);
    return { ok: true, creditedCents: amount };
  }

  listAdmin() {
    return this.prisma.giftCard.findMany({
      include: {
        purchaser: { select: { email: true, name: true } },
        recipient: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
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
      throw new BadRequestException('Only active gift cards can be deactivated');
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
    if (dto.recipientId !== undefined && (!recipient || recipient.role !== 'USER')) {
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
      const cards = await this.prisma.$transaction(async (tx) => {
        const created = await Promise.all(
          Array.from({ length: dto.quantity }, async () => {
            const createData: Record<string, unknown> = {
              code: randomBytes(8).toString('hex').toUpperCase(),
              amountCents: dto.amountCents,
              balanceCents: dto.amountCents,
              status: GiftCardStatus.ACTIVE,
              purchaserId: adminId,
              recipientId: recipient?.id,
              recipientName,
              recipientEmail,
              message: dto.message,
              expiresAt,
            };
            if (imageUrl !== null) {
              createData.imageUrl = imageUrl;
            }
            return tx.giftCard.create({
              data: createData as unknown as Prisma.GiftCardUncheckedCreateInput,
            });
          }),
        );
        return created;
      });
      if (recipientEmail) {
        await Promise.all(
          cards.map((card) => this.sendGiftCardEmail(recipientEmail, card.code)),
        );
      }
      await Promise.all(
        cards.map((card) =>
          this.audit.log({
            actorId: adminId,
            actorRole: 'ADMIN',
            action: 'GIFT_CARD_CREATED_ADMIN',
            entityType: 'GiftCard',
            entityId: card.id,
            payload: {
              amountCents: card.amountCents,
              recipientEmail: card.recipientEmail ?? null,
              recipientId: card.recipientId ?? null,
              imageUrl,
            },
          }),
        ),
      );
      return dto.quantity === 1 ? cards[0] : cards;
    } catch (error) {
      if (uploadedImageUrl !== null) {
        await this.removeStoredGiftCardImage(uploadedImageUrl);
      }
      throw error;
    }
  }

  async assignRecipient(giftCardId: string, userId: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { id: giftCardId } });
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
      amountCents: card.amountCents,
      balanceCents: card.balanceCents,
      events,
      note:
        'Detailed redemption ledger is not stored yet; timeline shows available gift-card activity.',
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
    const absolute = absolutePathForStoredGiftCardUpload(this.uploadRoot, stored);
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
}
