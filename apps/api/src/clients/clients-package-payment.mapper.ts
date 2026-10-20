import type { Prisma } from '@prisma/client';
import { readCouponSnapshot } from '../coupons/coupon-metadata.util';
import { readGiftCreditsAppliedCents } from '../packages/package-gift-credits.util';

export type ClientPackagePaymentRow = {
  id: string;
  status: string;
  paymentMethod: string | null;
  amountCents: number;
  metadata: Prisma.JsonValue | null;
};

export type ClientPackagePaymentApi = {
  paymentId: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paymentAmountCents: number | null;
  /** Price before promo code and gift credits; null when nothing was discounted. */
  paymentListPriceCents: number | null;
  paymentCouponCode: string | null;
};

/** Payment fields shown on the staff client package card. */
export function toClientPackagePaymentApi(
  payment: ClientPackagePaymentRow | undefined,
): ClientPackagePaymentApi {
  if (payment === undefined) {
    return {
      paymentId: null,
      paymentStatus: null,
      paymentMethod: null,
      paymentAmountCents: null,
      paymentListPriceCents: null,
      paymentCouponCode: null,
    };
  }
  const coupon = readCouponSnapshot(payment.metadata);
  const discountCents =
    (coupon?.discountAmountCents ?? 0) +
    readGiftCreditsAppliedCents(payment.metadata);
  return {
    paymentId: payment.id,
    paymentStatus: payment.status,
    paymentMethod: payment.paymentMethod,
    paymentAmountCents: payment.amountCents,
    paymentListPriceCents:
      discountCents > 0 ? payment.amountCents + discountCents : null,
    paymentCouponCode: coupon?.code ?? null,
  };
}
