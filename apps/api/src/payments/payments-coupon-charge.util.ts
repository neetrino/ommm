import type { PrismaService } from '../prisma/prisma.service';
import { planDropInGiftCharge } from './payments-dropin-gift';
import { quoteCoupon } from '../coupons/coupon-quote.util';
import type {
  CouponPurchaseLine,
  CouponSnapshot,
} from '../coupons/coupon.types';

export type CouponCharge = {
  coupon: CouponSnapshot | null;
  appliedGiftCents: number;
  chargeCents: number;
};

/** Coupon discount first, then gift credit. An empty code leaves the price unchanged. */
export async function quoteCouponThenGift(
  db: PrismaService,
  input: {
    userId: string;
    code?: string;
    subtotalCents: number;
    lines: readonly CouponPurchaseLine[];
    spendableCents: number;
    useGiftCredits: boolean;
    excludePaymentIds?: readonly string[];
  },
): Promise<CouponCharge> {
  const coupon = await quoteCoupon(db, {
    userId: input.userId,
    code: input.code,
    subtotalCents: input.subtotalCents,
    lines: input.lines,
    excludePaymentIds: input.excludePaymentIds,
  });
  const afterCoupon = coupon?.amountAfterCouponCents ?? input.subtotalCents;
  const gift = planDropInGiftCharge({
    priceCents: afterCoupon,
    spendableCents: input.spendableCents,
    useGiftCredits: input.useGiftCredits,
  });
  return {
    coupon,
    appliedGiftCents: gift.appliedCents,
    chargeCents: gift.chargeCents,
  };
}
