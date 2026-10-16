import type { CouponDiscountType } from '@prisma/client';

export type CouponDiscountQuote = {
  discountCents: number;
  remainderGiftCents: number;
  amountAfterCouponCents: number;
};

/**
 * Percentage coupons have no balance. A fixed coupon that exceeds the
 * subtotal discounts the purchase to zero and returns the unused AMD.
 */
export function quoteCouponDiscount(input: {
  subtotalCents: number;
  discountType: CouponDiscountType;
  discountValue: number;
}): CouponDiscountQuote {
  const subtotal = Math.max(0, Math.floor(input.subtotalCents));
  if (input.discountType === 'PERCENTAGE') {
    const discount = Math.floor((subtotal * input.discountValue) / 100);
    return {
      discountCents: discount,
      remainderGiftCents: 0,
      amountAfterCouponCents: subtotal - discount,
    };
  }
  const discount = Math.min(Math.max(0, input.discountValue), subtotal);
  return {
    discountCents: discount,
    remainderGiftCents: Math.max(0, input.discountValue - discount),
    amountAfterCouponCents: subtotal - discount,
  };
}
