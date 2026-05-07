import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GiftCardStatus } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GiftCardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  listMine(userId: string) {
    return this.prisma.giftCard.findMany({
      where: { purchaserId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  listReceived(userId: string) {
    return this.prisma.giftCard.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async redeem(userId: string, code: string) {
    const normalized = code.trim().toUpperCase();
    const card = await this.prisma.giftCard.findUnique({
      where: { code: normalized },
    });
    if (!card || card.status !== GiftCardStatus.ACTIVE) {
      throw new NotFoundException("Invalid code");
    }
    if (card.balanceCents <= 0) {
      throw new BadRequestException("Gift card has no balance");
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
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  async deactivate(id: string) {
    return this.prisma.giftCard.update({
      where: { id },
      data: { status: GiftCardStatus.DEACTIVATED },
    });
  }

  async resendEmail(id: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { id } });
    if (!card?.recipientEmail) {
      throw new BadRequestException("No recipient email");
    }
    const web = process.env.WEB_APP_URL ?? "http://localhost:3000";
    await this.mail.sendEmail({
      to: card.recipientEmail,
      subject: "Your Ommm gift card",
      html: `<p>Code: <strong>${card.code}</strong></p><p>Redeem at ${web}</p>`,
    });
    return { ok: true };
  }
}
