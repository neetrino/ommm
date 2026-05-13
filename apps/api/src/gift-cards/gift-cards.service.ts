import {
  BadRequestException,
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

  async deactivate(id: string) {
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
    const card = await this.prisma.giftCard.findUnique({ where: { id } });
    if (!card?.recipientEmail) {
      throw new BadRequestException('No recipient email');
    }
    const web = process.env.WEB_APP_URL ?? 'http://localhost:3000';
    await this.mail.sendEmail({
      to: card.recipientEmail,
      subject: 'Your Ommm gift card',
      html: `<p>Code: <strong>${card.code}</strong></p><p>Redeem at ${web}</p>`,
    });
    return { ok: true };
  }

  async createAdminCard(adminId: string, dto: AdminCreateGiftCardDto) {
    const code = randomBytes(8).toString('hex').toUpperCase();
    const expiresAt =
      dto.expiresAt !== undefined ? new Date(dto.expiresAt) : undefined;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt date');
    }
    const card = await this.prisma.giftCard.create({
      data: {
        code,
        amountCents: dto.amountCents,
        balanceCents: dto.amountCents,
        status: GiftCardStatus.ACTIVE,
        purchaserId: adminId,
        recipientName: dto.recipientName,
        recipientEmail: dto.recipientEmail,
        message: dto.message,
        expiresAt,
      },
    });
    if (card.recipientEmail) {
      const web = process.env.WEB_APP_URL ?? 'http://localhost:3000';
      await this.mail.sendEmail({
        to: card.recipientEmail,
        subject: 'Your Ommm gift card',
        html: `<p>Code: <strong>${card.code}</strong></p><p>Redeem at ${web}</p>`,
      });
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
      },
    });
    return card;
  }
}
