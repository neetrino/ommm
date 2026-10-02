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
import { EhdmReceiptService } from './ehdm/ehdm-receipt.service';
import { resolveGiftCardPolicy } from '../gift-cards/gift-card-policy';
import { peekSpendableGiftCreditsCents } from '../packages/package-gift-credits.util';
import {
  assertCustomGiftAmount,
  assertDropInSessionForCheckout,
  assertGiftBatchForCheckout,
  findOwnedPendingPaymentByReference,
} from './payments-checkout.helpers';
import {
  planDropInGiftCharge,
  reservePendingDropInGift,
} from './payments-dropin-gift';
import { prepareGiftCheckout } from './payments-gift-checkout.prepare';
import { dispatchDueGiftEmails } from './payments-gift-delivery';
import { PaymentsConfirmService } from './payments-confirm.service';
import {
  createPaymentReference,
  withInternalPaymentCreateFields,
  withInternalPaymentUpdateFields,
  withInternalPaymentWhereFields,
} from './payments.helpers';
import { ownerBookingUniqueWhere } from '../bookings/bookings-guest-pass.constants';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import {
  INTERNAL_PAYMENT_SOURCE,
  type GiftEmailPayload,
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
    private readonly ehdmReceipt: EhdmReceiptService,
  ) {}

  isArcaCheckoutEnabled(): boolean {
    return isArcaCheckoutEnabled(this.config);
  }

  async createGiftCheckout(params: Parameters<typeof prepareGiftCheckout>[1]) {
    const prepared = await prepareGiftCheckout(this.prisma, params);
    if (prepared.metadata.giftType !== 'FIXED_CLASS') {
      await this.assertGiftCheckoutAmount(params.batchId, prepared.amountCents);
    }
    return this.prisma.payment.create({
      data: withInternalPaymentCreateFields({
        userId: params.purchaserId,
        amountCents: prepared.amountCents,
        currency: 'amd',
        status: PaymentStatus.PENDING,
        paymentReference: createPaymentReference('GIFT'),
        source: INTERNAL_PAYMENT_SOURCE.GIFT,
        sourceId: params.batchId,
        description: prepared.description,
        metadata: prepared.metadata,
      }),
    });
  }

  private async assertGiftCheckoutAmount(
    batchId: string | undefined,
    amountCents: number,
  ): Promise<void> {
    if (batchId === undefined) {
      const row = await this.prisma.studioSettings.findFirst({
        select: {
          giftCardMinAmountAmd: true,
          giftCardValidityMonths: true,
          giftCardDenominationsJson: true,
        },
      });
      assertCustomGiftAmount(amountCents, resolveGiftCardPolicy(row));
      return;
    }
    const batch = await this.prisma.giftCardBatch.findUnique({
      where: { id: batchId },
      select: {
        amountAmd: true,
        availableQuantity: true,
        status: true,
      },
    });
    assertGiftBatchForCheckout(batch, amountCents);
  }

  async dispatchDueGiftEmails(): Promise<number> {
    return dispatchDueGiftEmails(this.prisma, (payload) =>
      this.fulfillment.sendGiftCardEmail(payload),
    );
  }

  async createDropInCheckout(
    userId: string,
    sessionId: string,
    useGiftCredits = false,
  ) {
    const classSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    const existingBooking = await this.prisma.booking.findUnique({
      where: ownerBookingUniqueWhere(userId, sessionId),
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
    const spendableCents = useGiftCredits
      ? await peekSpendableGiftCreditsCents(this.prisma, userId)
      : 0;
    const gift = planDropInGiftCharge({
      priceCents: classSession!.priceCents,
      spendableCents,
      useGiftCredits,
    });
    if (existingPending) {
      return existingPending;
    }
    if (gift.chargeCents === 0) {
      return this.settleGiftCoveredDropIn(userId, sessionId, gift.appliedCents);
    }

    return this.prisma.payment.create({
      data: withInternalPaymentCreateFields({
        userId,
        amountCents: gift.chargeCents,
        currency: 'amd',
        status: PaymentStatus.PENDING,
        paymentReference: createPaymentReference('DROPIN'),
        source: INTERNAL_PAYMENT_SOURCE.DROPIN,
        sourceId: sessionId,
        description: `Drop-in session ${sessionId}`,
        metadata:
          gift.appliedCents > 0
            ? { giftCreditsAppliedCents: gift.appliedCents }
            : undefined,
      }),
    });
  }

  private async settleGiftCoveredDropIn(
    userId: string,
    sessionId: string,
    appliedCents: number,
  ) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: withInternalPaymentCreateFields({
          userId,
          amountCents: 0,
          currency: 'amd',
          status: PaymentStatus.PENDING,
          paymentReference: createPaymentReference('DROPIN'),
          source: INTERNAL_PAYMENT_SOURCE.DROPIN,
          sourceId: sessionId,
          description: `Drop-in session ${sessionId}`,
          metadata: { giftCreditsAppliedCents: appliedCents },
        }),
      });
      await reservePendingDropInGift(tx, created);
      await this.fulfillment.fulfillDropInPayment(tx, userId, sessionId);
      return tx.payment.update({
        where: { id: created.id },
        data: withInternalPaymentUpdateFields({
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          paymentMethod: ManualPaymentMethod.CARD,
        }),
      });
    });
    await this.fulfillment.emitDropInBookingRealtimeIfNeeded(payment);
    return payment;
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
        id: existing.id,
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
      await this.fulfillment.sendGiftCardEmail(email);
    }
    await this.paymentSuccessEmail.trySendSuccessEmails(
      payment.id,
      PaymentStatus.PENDING,
    );
    this.ehdmReceipt.tryPrintReceipt(payment.id, PaymentStatus.PENDING);
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
