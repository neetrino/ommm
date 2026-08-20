import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { GiftPaymentMethod } from './dto/confirm-gift-payment.dto';
import { mergeArcaMetadata } from './arca/arca-metadata.util';
import { isArcaCheckoutEnabled } from './payment-arca.util';
import { PAYMENT_STATUS_REASON } from './payment-status-reason';
import { PaymentCashPendingEmailService } from './payment-cash-pending-email.service';
import { PaymentSuccessEmailService } from './payment-success-email.service';
import {
  assertDropInSessionForCheckout,
  assertGiftBatchForCheckout,
  findOwnedPendingPaymentByReference,
} from './payments-checkout.helpers';
import { PaymentsConfirmService } from './payments-confirm.service';
import {
  createPaymentReference,
  withInternalPaymentCreateFields,
  withInternalPaymentUpdateFields,
  withInternalPaymentWhereFields,
} from './payments.helpers';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import {
  INTERNAL_PAYMENT_SOURCE,
  type GiftEmailPayload,
  type PaymentMetadata,
} from './payments.types';

@Injectable()
export class PaymentsCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly fulfillment: PaymentsFulfillmentService,
    private readonly confirm: PaymentsConfirmService,
    private readonly paymentSuccessEmail: PaymentSuccessEmailService,
    private readonly paymentCashPendingEmail: PaymentCashPendingEmailService,
  ) {}

  isArcaCheckoutEnabled(): boolean {
    return isArcaCheckoutEnabled(this.config);
  }

  async createGiftCheckout(params: {
    purchaserId: string;
    batchId?: string;
    amountCents: number;
    recipientId: string;
    recipientName?: string;
    recipientEmail?: string;
    message?: string;
  }) {
    const resolvedRecipient = await this.resolveGiftRecipient({
      purchaserId: params.purchaserId,
      recipientId: params.recipientId,
      recipientName: params.recipientName,
      recipientEmail: params.recipientEmail,
    });
    const metadata: PaymentMetadata = {
      recipientId: resolvedRecipient.recipientId,
      ...(resolvedRecipient.recipientName
        ? { recipientName: resolvedRecipient.recipientName }
        : {}),
      ...(resolvedRecipient.recipientEmail
        ? { recipientEmail: resolvedRecipient.recipientEmail }
        : {}),
      ...(params.message ? { message: params.message } : {}),
    };
    if (params.batchId !== undefined) {
      const batch = await this.prisma.giftCardBatch.findUnique({
        where: { id: params.batchId },
        select: {
          amountAmd: true,
          availableQuantity: true,
          status: true,
        },
      });
      assertGiftBatchForCheckout(batch, params.amountCents);
    }

    return this.prisma.payment.create({
      data: withInternalPaymentCreateFields({
        userId: params.purchaserId,
        amountCents: params.amountCents,
        currency: 'amd',
        status: PaymentStatus.PENDING,
        paymentReference: createPaymentReference('GIFT'),
        source: INTERNAL_PAYMENT_SOURCE.GIFT,
        sourceId: params.batchId,
        description: 'Gift card purchase (gift)',
        metadata: metadata,
      }),
    });
  }

  private async resolveGiftRecipient(params: {
    purchaserId: string;
    recipientId: string;
    recipientName?: string;
    recipientEmail?: string;
  }): Promise<{
    recipientId: string;
    recipientName?: string;
    recipientEmail?: string;
  }> {
    if (params.recipientId.trim() === '') {
      throw new BadRequestException('Gift recipient is required');
    }
    if (params.recipientId === params.purchaserId) {
      throw new BadRequestException('Cannot gift a card to yourself');
    }
    const recipient = await this.prisma.user.findFirst({
      where: {
        id: params.recipientId,
        role: 'USER',
        isBlocked: false,
      },
      select: { id: true, email: true, name: true, lastName: true },
    });
    if (!recipient) {
      throw new BadRequestException('Gift recipient not found');
    }
    const displayName = [recipient.name, recipient.lastName]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(' ')
      .trim();
    return {
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      recipientName:
        displayName.length > 0 ? displayName : params.recipientName,
    };
  }

  async createDropInCheckout(userId: string, sessionId: string) {
    const classSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    const existingBooking = await this.prisma.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    const booked = await this.prisma.booking.count({
      where: { sessionId, status: 'BOOKED' },
    });
    assertDropInSessionForCheckout(classSession, existingBooking, booked);

    const existingPending = await this.prisma.payment.findFirst({
      where: {
        userId,
        ...withInternalPaymentWhereFields({
          source: INTERNAL_PAYMENT_SOURCE.DROPIN,
          sourceId: sessionId,
        }),
        status: PaymentStatus.PENDING,
      },
    });
    if (existingPending) {
      return existingPending;
    }

    return this.prisma.payment.create({
      data: withInternalPaymentCreateFields({
        userId,
        amountCents: classSession!.priceCents,
        currency: 'amd',
        status: PaymentStatus.PENDING,
        paymentReference: createPaymentReference('DROPIN'),
        source: INTERNAL_PAYMENT_SOURCE.DROPIN,
        sourceId: sessionId,
        description: `Drop-in session ${sessionId}`,
      }),
    });
  }

  /** Confirms a pending card payment after the user checkout flow completes. */
  async confirmPendingCardPayment(paymentId: string): Promise<void> {
    await this.confirmPayment(paymentId, null, {
      paymentMethod: ManualPaymentMethod.CARD,
    });
  }

  async confirmDropInPayment(
    userId: string,
    paymentReference: string,
    paymentMethod: ManualPaymentMethod,
  ) {
    if (paymentMethod === ManualPaymentMethod.CASH) {
      return this.confirmDropInCashPayment(userId, paymentReference);
    }

    if (this.isArcaCheckoutEnabled()) {
      throw new BadRequestException(
        'Card payments must be completed through Arca checkout',
      );
    }

    const existing = await findOwnedPendingPaymentByReference(
      this.prisma,
      userId,
      paymentReference,
      INTERNAL_PAYMENT_SOURCE.DROPIN,
      'Payment is not a drop-in checkout',
    );

    return this.confirmPayment(existing.id, null, {
      paymentMethod: ManualPaymentMethod.CARD,
    });
  }

  async confirmDropInCashPayment(userId: string, paymentReference: string) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = await findOwnedPendingPaymentByReference(
        tx,
        userId,
        paymentReference,
        INTERNAL_PAYMENT_SOURCE.DROPIN,
        'Payment is not a drop-in checkout',
      );
      await this.fulfillment.fulfillDropInPayment(
        tx,
        existing.userId,
        existing.sourceId ?? null,
      );
      return tx.payment.update({
        where: { id: existing.id },
        data: withInternalPaymentUpdateFields({
          paymentMethod: ManualPaymentMethod.CASH,
          metadata: mergeArcaMetadata(existing.metadata ?? null, {
            statusReason: PAYMENT_STATUS_REASON.AWAITING_CASH,
          }),
        }),
      });
    });
    await this.fulfillment.emitDropInBookingRealtimeIfNeeded(payment);
    await this.paymentCashPendingEmail.trySendCashPendingEmail(payment.id);
    return payment;
  }

  async confirmGiftPayment(
    userId: string,
    paymentReference: string,
    paymentMethod: GiftPaymentMethod,
  ) {
    if (paymentMethod === ManualPaymentMethod.CASH) {
      const payment = await this.prisma.$transaction(async (tx) => {
        const existing = await findOwnedPendingPaymentByReference(
          tx,
          userId,
          paymentReference,
          INTERNAL_PAYMENT_SOURCE.GIFT,
          'Payment is not a gift purchase',
        );
        return tx.payment.update({
          where: { id: existing.id },
          data: withInternalPaymentUpdateFields({
            paymentMethod: ManualPaymentMethod.CASH,
            metadata: mergeArcaMetadata(existing.metadata ?? null, {
              statusReason: PAYMENT_STATUS_REASON.AWAITING_CASH,
            }),
          }),
        });
      });
      await this.paymentCashPendingEmail.trySendCashPendingEmail(payment.id);
      return payment;
    }

    if (this.isArcaCheckoutEnabled()) {
      throw new BadRequestException(
        'Card payments must be completed through Arca checkout',
      );
    }

    const giftEmails: GiftEmailPayload[] = [];
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = await findOwnedPendingPaymentByReference(
        tx,
        userId,
        paymentReference,
        INTERNAL_PAYMENT_SOURCE.GIFT,
        'Payment is not a gift purchase',
      );
      const email = await this.fulfillment.fulfillGiftPayment(tx, {
        userId: existing.userId,
        amountCents: existing.amountCents,
        sourceId: existing.sourceId ?? null,
        metadata: existing.metadata ?? null,
      });
      if (email) {
        giftEmails.push(email);
      }
      return tx.payment.update({
        where: { id: existing.id },
        data: withInternalPaymentUpdateFields({
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          paymentMethod,
        }),
      });
    });
    for (const email of giftEmails) {
      await this.fulfillment.sendGiftCardEmail(email.to, email.code);
    }
    await this.paymentSuccessEmail.trySendSuccessEmails(
      payment.id,
      PaymentStatus.PENDING,
    );
    return payment;
  }

  confirmPayment(
    paymentId: string,
    adminId: string | null,
    options?: { paymentMethod?: ManualPaymentMethod },
  ) {
    return this.confirm.confirmPayment(paymentId, adminId, options);
  }
}
