import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { buildGiftCardDeliveryEmail } from '../mail/templates/gift-card.template';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { readPackagePlanIdFromMetadata } from '../packages/package-payment-metadata.util';
import {
  readGiftCreditsAppliedCents,
  recordGiftCreditSpendPayment,
} from '../packages/package-gift-credits.util';
import { buildUserPackageCreateData } from '../packages/packages-subscribe-card.util';
import { decrementPackagePlanStock } from '../packages/packages-stock.helpers';
import { createBalancesForUserPackage } from '../packages/packages-user-package-balances.util';
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

  /**
   * Activates a legacy PENDING UserPackage, or creates an ACTIVE UserPackage
   * from `metadata.planId` when payment had no package yet (deferred create).
   */
  async fulfillPackagePayment(
    tx: Prisma.TransactionClient,
    payment: {
      id: string;
      userId: string;
      sourceId: string | null;
      metadata: Prisma.JsonValue | null;
    },
  ): Promise<boolean> {
    if (payment.sourceId !== null) {
      return this.activateLegacyPendingPackage(tx, payment.sourceId);
    }
    return this.createPackageFromDeferredPayment(tx, payment);
  }

  private async activateLegacyPendingPackage(
    tx: Prisma.TransactionClient,
    userPackageId: string,
  ): Promise<boolean> {
    const userPackage = await tx.userPackage.findUnique({
      where: { id: userPackageId },
      select: { id: true, status: true, planId: true },
    });
    if (!userPackage) {
      throw new NotFoundException('User package not found for payment');
    }
    if (userPackage.status !== UserPackageStatus.PENDING) {
      return false;
    }
    await tx.userPackage.update({
      where: { id: userPackageId },
      data: { status: UserPackageStatus.ACTIVE },
    });
    if (userPackage.planId === null) {
      return false;
    }
    return decrementPackagePlanStock(tx, userPackage.planId);
  }

  private async createPackageFromDeferredPayment(
    tx: Prisma.TransactionClient,
    payment: {
      id: string;
      userId: string;
      metadata: Prisma.JsonValue | null;
    },
  ): Promise<boolean> {
    const planId = readPackagePlanIdFromMetadata(payment.metadata);
    if (planId === null) {
      throw new BadRequestException('Package payment is missing plan id');
    }
    const plan = await tx.packagePlan.findUnique({ where: { id: planId } });
    if (plan === null) {
      throw new NotFoundException('Package plan not found for payment');
    }
    const userPackage = await tx.userPackage.create({
      data: buildUserPackageCreateData({
        userId: payment.userId,
        plan,
        status: UserPackageStatus.ACTIVE,
      }),
    });
    await createBalancesForUserPackage(tx, {
      plan,
      userPackageId: userPackage.id,
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: { sourceId: userPackage.id },
    });
    const giftCreditsAppliedCents = readGiftCreditsAppliedCents(
      payment.metadata,
    );
    await recordGiftCreditSpendPayment(tx, {
      userId: payment.userId,
      appliedCents: giftCreditsAppliedCents,
      planName: plan.name,
      userPackageId: userPackage.id,
      currency: plan.currency,
    });
    return decrementPackagePlanStock(tx, plan.id);
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
    const recipientId = metadata.recipientId || undefined;
    await tx.giftCard.create({
      data: {
        batchId: selectedBatch?.id,
        code,
        amountAmd: selectedBatch?.amountAmd ?? payment.amountCents,
        balanceAmd: selectedBatch?.amountAmd ?? payment.amountCents,
        imageUrl: selectedBatch?.imageUrl ?? undefined,
        status: GiftCardStatus.ACTIVE,
        purchaserId: payment.userId,
        recipientId,
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
  ): Promise<{
    giftEmail: GiftEmailPayload | null;
    packageStockTracked: boolean;
  }> {
    if (existing.source === INTERNAL_PAYMENT_SOURCE.DROPIN) {
      await this.fulfillDropInPayment(
        tx,
        existing.userId,
        existing.sourceId ?? null,
      );
      return { giftEmail: null, packageStockTracked: false };
    }
    if (existing.source === INTERNAL_PAYMENT_SOURCE.PACKAGE) {
      const packageStockTracked = await this.fulfillPackagePayment(tx, {
        id: existing.id,
        userId: existing.userId,
        sourceId: existing.sourceId ?? null,
        metadata: existing.metadata ?? null,
      });
      return { giftEmail: null, packageStockTracked };
    }
    if (existing.source !== INTERNAL_PAYMENT_SOURCE.GIFT) {
      return { giftEmail: null, packageStockTracked: false };
    }
    const giftEmail = await this.fulfillGiftPayment(tx, {
      userId: existing.userId,
      amountCents: existing.amountCents,
      sourceId: existing.sourceId ?? null,
      metadata: existing.metadata ?? null,
    });
    return { giftEmail, packageStockTracked: false };
  }

  async sendGiftCardEmail(to: string, code: string): Promise<void> {
    await this.mail.sendEmail({
      to,
      ...buildGiftCardDeliveryEmail({
        code,
        webAppUrl: this.config.get<string>('WEB_APP_URL'),
      }),
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
