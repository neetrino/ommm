import type { CouponDiscountType, CouponProductKind } from '@prisma/client';

export type CouponPurchaseLine = {
  kind: CouponProductKind;
  packagePlanId?: string;
};

export type CouponProductRule = {
  productKind: CouponProductKind;
  packagePlanId: string | null;
};

/** Immutable checkout snapshot stored on the payment and the redemption row. */
export type CouponSnapshot = {
  couponId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  createdById: string;
  originalAmountCents: number;
  discountAmountCents: number;
  remainderGiftCents: number;
  amountAfterCouponCents: number;
};

export type CouponUsageCounts = {
  totalUsed: number;
  userUsed: number;
};
