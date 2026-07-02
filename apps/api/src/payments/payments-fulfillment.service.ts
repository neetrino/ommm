import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  Prisma,
  UserPackageStatus,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { parsePaymentMetadata } from './payments.helpers';
import {
  INTERNAL_PAYMENT_SOURCE,
  type GiftCardBatchSnapshot,
  type GiftEmailPayload,
  type InternalPaymentRecord,
} from './payments.types';

@Injectable()
export class PaymentsFulfillmentService {
  constructor(
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  async fulfillDropInPayment(
    tx: Prisma.TransactionClient,
    userId: string,
    sessionId: string | null,
  ): Promise<void> {
    if (!sessionId) {
      throw new BadRequestException('Drop-in payment is missing session');
    }
    const classSession = await tx.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!classSession || classSession.status === ClassSessionStatus.CANCELLED) {
      throw new BadRequestException('Session is not available');
    }
    if (classSession.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    const existing = await tx.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (existing?.status === BookingStatus.BOOKED) {
      return;
    }
    const booked = await tx.booking.count({
      where: { sessionId, status: BookingStatus.BOOKED },
    });
    if (booked >= classSession.capacity) {
      throw new BadRequestException('Session is full — join waitlist');
    }
    if (existing) {
      await tx.booking.update({
        where: { id: existing.id },
        data: {
          status: BookingStatus.BOOKED,
          cancelledAt: null,
          attendedAt: null,
        },
      });
    } else {
      await tx.booking.create({
        data: { userId, sessionId, status: BookingStatus.BOOKED },
      });
    }
    if (booked + 1 >= classSession.capacity) {
      await tx.classSession.update({
        where: { id: sessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
  }

  async fulfillPackagePayment(
    tx: Prisma.TransactionClient,
    userPackageId: string | null,
  ): Promise<void> {
    if (!userPackageId) {
      throw new BadRequestException('Package payment is missing package id');
    }
    const userPackage = await tx.userPackage.findUnique({
      where: { id: userPackageId },
      select: { id: true, status: true },
    });
    if (!userPackage) {
      throw new NotFoundException('User package not found for payment');
    }
    if (userPackage.status !== UserPackageStatus.PENDING) {
      return;
    }
    await tx.userPackage.update({
      where: { id: userPackageId },
      data: { status: UserPackageStatus.ACTIVE },
    });
  }

  async fulfillGiftPayment(
    tx: Prisma.TransactionClient,
    payment: {
      userId: string;
      amountCents: number;
      sourceId: string | null;
      metadata: Prisma.JsonValue | null;
    },
  ): Promise<GiftEmailPayload | null> {
    const metadata = parsePaymentMetadata(payment.metadata);
    let selectedBatch: GiftCardBatchSnapshot | null = null;
    if (payment.sourceId) {
      const decremented = await tx.giftCardBatch.updateMany({
        where: {
          id: payment.sourceId,
          status: GiftCardStatus.ACTIVE,
          availableQuantity: { gt: 0 },
        },
        data: { availableQuantity: { decrement: 1 } },
      });
      if (decremented.count !== 1) {
        throw new BadRequestException('Gift card is out of stock');
      }
      selectedBatch = await tx.giftCardBatch.findUnique({
        where: { id: payment.sourceId },
        select: {
          id: true,
          amountAmd: true,
          imageUrl: true,
          expiresAt: true,
          message: true,
          recipientName: true,
          recipientEmail: true,
          availableQuantity: true,
          status: true,
        },
      });
      if (!selectedBatch) {
        throw new BadRequestException('Gift-card batch not found');
      }
    }
    const code = randomBytes(8).toString('hex').toUpperCase();
    const recipientEmail =
      metadata.recipientEmail || selectedBatch?.recipientEmail || undefined;
    await tx.giftCard.create({
      data: {
        batchId: selectedBatch?.id,
        code,
        amountAmd: selectedBatch?.amountAmd ?? payment.amountCents,
        balanceAmd: selectedBatch?.amountAmd ?? payment.amountCents,
        imageUrl: selectedBatch?.imageUrl ?? undefined,
        status: GiftCardStatus.ACTIVE,
        purchaserId: payment.userId,
        recipientName:
          metadata.recipientName || selectedBatch?.recipientName || undefined,
        recipientEmail,
        message: metadata.message || selectedBatch?.message || undefined,
        expiresAt: selectedBatch?.expiresAt ?? undefined,
      },
    });
    return recipientEmail ? { to: recipientEmail, code } : null;
  }

  async fulfillPaymentBySource(
    tx: Prisma.TransactionClient,
    existing: InternalPaymentRecord,
  ): Promise<GiftEmailPayload | null> {
    if (existing.source === INTERNAL_PAYMENT_SOURCE.DROPIN) {
      await this.fulfillDropInPayment(
        tx,
        existing.userId,
        existing.sourceId ?? null,
      );
      return null;
    }
    if (existing.source === INTERNAL_PAYMENT_SOURCE.PACKAGE) {
      await this.fulfillPackagePayment(tx, existing.sourceId ?? null);
      return null;
    }
    if (existing.source !== INTERNAL_PAYMENT_SOURCE.GIFT) {
      return null;
    }
    return this.fulfillGiftPayment(tx, {
      userId: existing.userId,
      amountCents: existing.amountCents,
      sourceId: existing.sourceId ?? null,
      metadata: existing.metadata ?? null,
    });
  }

  async sendGiftCardEmail(to: string, code: string): Promise<void> {
    const web =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    await this.mail.sendEmail({
      to,
      subject: 'Your Ommm gift card',
      html: `<p>Your code: <strong>${code}</strong></p><p>Redeem at ${web}</p>`,
    });
  }

  async emitDropInBookingRealtimeIfNeeded(
    payment: InternalPaymentRecord,
  ): Promise<void> {
    if (payment.source !== INTERNAL_PAYMENT_SOURCE.DROPIN) {
      return;
    }
    const sessionId = payment.sourceId?.trim();
    if (!sessionId) {
      return;
    }
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: payment.userId,
      sessionId,
    });
  }
}
