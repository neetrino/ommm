import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';

@Injectable()
export class GiftCardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
  ) {}

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

  async createAdminCard(adminId: string, dto: AdminCreateGiftCardDto) {
    const code = randomBytes(8).toString('hex').toUpperCase();
    const expiresAt =
      dto.expiresAt !== undefined ? new Date(dto.expiresAt) : undefined;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt date');
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

    const card = await this.prisma.giftCard.create({
      data: {
        code,
        amountCents: dto.amountCents,
        balanceCents: dto.amountCents,
        status: GiftCardStatus.ACTIVE,
        purchaserId: adminId,
        recipientId: recipient?.id,
        recipientName,
        recipientEmail,
        message: dto.message,
        expiresAt,
      },
    });
    if (card.recipientEmail) {
      await this.sendGiftCardEmail(card.recipientEmail, card.code);
    }
    await this.audit.log({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'GIFT_CARD_CREATED_ADMIN',
      entityType: 'GiftCard',
      entityId: card.id,
      payload: {
        amountCents: card.amountCents,
        recipientEmail: card.recipientEmail ?? null,
        recipientId: card.recipientId ?? null,
      },
    });
    return card;
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
}
