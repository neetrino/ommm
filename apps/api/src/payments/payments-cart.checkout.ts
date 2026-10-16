import { Injectable } from '@nestjs/common';
import {
  CouponProductKind,
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  type Prisma,
} from '@prisma/client';
import {
  applyReservedCoupon,
  reserveCouponRedemption,
} from '../coupons/coupon-redemption.util';
import { quoteCoupon } from '../coupons/coupon-quote.util';
import type { CouponPurchaseLine, CouponSnapshot } from '../coupons/coupon.types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCartCheckoutDto } from './dto/create-cart-checkout.dto';
import {
  createPaymentReference,
  withInternalPaymentCreateFields,
  withInternalPaymentUpdateFields,
} from './payments.helpers';
import { loadCartLines, type CartLineSnapshot } from './payments-cart.load';
import { fulfillStudioCart } from './payments-cart.fulfill';
import { CART_CHECKOUT_KIND, quoteStudioCart } from './payments-cart.quote';
import { INTERNAL_PAYMENT_SOURCE } from './payments.types';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import {
  failUnsentPendingPayments,
  listPendingCheckoutPayments,
  unsentPaymentIds,
} from './payments-pending-reuse.util';

@Injectable()
export class PaymentsCartCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fulfillment: PaymentsFulfillmentService,
  ) {}

  async create(userId: string, dto: CreateCartCheckoutDto) {
    const lines = await loadCartLines(this.prisma, userId, dto);
    const pending = await listPendingCheckoutPayments(this.prisma, {
      userId,
      source: PaymentSource.OTHER,
      checkoutKind: CART_CHECKOUT_KIND,
    });
    const replaceIds = unsentPaymentIds(pending);
    const priced = await this.priceCart(userId, dto, lines, replaceIds);
    const metadata = cartMetadata(lines, priced.quote);
    if (priced.quote.chargeCents === 0) {
      await failUnsentPendingPayments(this.prisma, replaceIds);
      return this.settleCovered(userId, metadata, priced.coupon);
    }
    return this.prisma.$transaction(async (tx) => {
      await failUnsentPendingPayments(tx, replaceIds);
      const payment = await tx.payment.create({
        data: withInternalPaymentCreateFields({
          userId,
          amountCents: priced.quote.chargeCents,
          currency: 'amd',
          status: PaymentStatus.PENDING,
          paymentReference: createPaymentReference('CART'),
          source: INTERNAL_PAYMENT_SOURCE.OTHER,
          description: 'Studio cart',
          metadata,
        }),
      });
      await attachCoupon(tx, userId, payment.id, priced.coupon, false);
      return payment;
    });
  }

  private async priceCart(
    userId: string,
    dto: CreateCartCheckoutDto,
    lines: CartLineSnapshot,
    excludePaymentIds: readonly string[],
  ) {
    const base = quoteCart(lines, dto.useGiftCredits === true, 0);
    const coupon = await quoteCoupon(this.prisma, {
      userId,
      code: dto.couponCode,
      subtotalCents: base.moneyTotalCents,
      lines: cartPurchaseLines(lines, base.sessionChargeCents),
      excludePaymentIds,
    });
    return {
      coupon,
      quote: quoteCart(lines, dto.useGiftCredits === true, coupon?.discountAmountCents ?? 0),
    };
  }

  private async settleCovered(
    userId: string,
    metadata: Record<string, string | number | undefined>,
    coupon: CouponSnapshot | null,
  ) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: withInternalPaymentCreateFields({
          userId,
          amountCents: 0,
          currency: 'amd',
          status: PaymentStatus.PENDING,
          paymentReference: createPaymentReference('CART'),
          source: INTERNAL_PAYMENT_SOURCE.OTHER,
          description: 'Studio cart',
          metadata,
        }),
      });
      await fulfillStudioCart(tx, created, this.fulfillment);
      await attachCoupon(tx, userId, created.id, coupon, true);
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
}

function quoteCart(lines: CartLineSnapshot, useGiftCredits: boolean, couponDiscountCents: number) {
  return quoteStudioCart({
    packageCents: lines.packageCents,
    sessionCents: lines.sessionCents,
    barCents: lines.barCents,
    classSessionsAvailable: lines.classSessionsAvailable,
    spendableGiftCents: lines.spendableGiftCents,
    useGiftCredits,
    hasSession: lines.sessionId !== null,
    couponDiscountCents,
  });
}

function cartMetadata(
  lines: CartLineSnapshot,
  quote: ReturnType<typeof quoteStudioCart>,
) {
  return {
    checkoutKind: CART_CHECKOUT_KIND,
    packagePlanId: lines.packagePlanId ?? undefined,
    sessionId: lines.sessionId ?? undefined,
    classTypeId: lines.classTypeId ?? undefined,
    barProductId: lines.barProductId ?? undefined,
    classSessionsCovered: quote.classSessionsCovered,
    giftCreditsAppliedCents:
      quote.appliedGiftCents > 0 ? quote.appliedGiftCents : undefined,
  };
}

function cartPurchaseLines(
  lines: CartLineSnapshot,
  sessionChargeCents: number,
): CouponPurchaseLine[] {
  const purchase: CouponPurchaseLine[] = [];
  if (lines.packageCents > 0 && lines.packagePlanId) {
    purchase.push({
      kind: CouponProductKind.PACKAGE,
      packagePlanId: lines.packagePlanId,
    });
  }
  if (sessionChargeCents > 0) {
    purchase.push({ kind: CouponProductKind.DROPIN });
  }
  if (lines.barCents > 0) {
    purchase.push({ kind: CouponProductKind.BAR });
  }
  return purchase;
}

async function attachCoupon(
  tx: Prisma.TransactionClient,
  userId: string,
  paymentId: string,
  coupon: CouponSnapshot | null,
  applyNow: boolean,
): Promise<void> {
  if (coupon === null) {
    return;
  }
  await reserveCouponRedemption(tx, { userId, paymentId, snapshot: coupon });
  if (applyNow) {
    await applyReservedCoupon(tx, paymentId);
  }
}
