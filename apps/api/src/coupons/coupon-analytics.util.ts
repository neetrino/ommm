import {
  CouponRedemptionStatus,
  type PaymentSource,
  type Prisma,
} from '@prisma/client';
import { readCartCheckout } from '../payments/payments-cart.fulfill';
import { readPackagePlanIdFromMetadata } from '../packages/package-payment-metadata.util';

/** Same rows that increment the coupon “used” count on the admin card. */
export const COUNTED_COUPON_USE_STATUSES = [
  CouponRedemptionStatus.RESERVED,
  CouponRedemptionStatus.APPLIED,
] as const;

const STUDIO_CART_DESCRIPTION = 'Studio cart';
const DROP_IN_ID_DESCRIPTION = /^Drop-in session\s+\S+$/i;
const PACKAGE_ID_DESCRIPTION = /^Package\s+[a-z0-9]{20,}$/i;

export type CouponPurchasePayment = {
  source: PaymentSource;
  sourceId: string | null;
  metadata: Prisma.JsonValue | null;
};

export type CouponPurchaseIds = {
  userPackageIds: string[];
  sessionIds: string[];
  planIds: string[];
  barProductIds: string[];
};

/**
 * Pending reservations have no `appliedAt`. Filter completed uses by
 * `appliedAt` and reservations by `createdAt`, so a counted use stays visible.
 */
export function couponAnalyticsTimeWhere(input: {
  from?: string;
  to?: string;
}): Prisma.CouponRedemptionWhereInput {
  if (input.from === undefined && input.to === undefined) {
    return {};
  }
  const range: Prisma.DateTimeFilter = {
    ...(input.from !== undefined ? { gte: new Date(input.from) } : {}),
    ...(input.to !== undefined ? { lte: new Date(input.to) } : {}),
  };
  return {
    OR: [{ appliedAt: range }, { appliedAt: null, createdAt: range }],
  };
}

export function collectCouponPurchaseIds(
  payments: readonly CouponPurchasePayment[],
): CouponPurchaseIds {
  const userPackageIds = new Set<string>();
  const sessionIds = new Set<string>();
  const planIds = new Set<string>();
  const barProductIds = new Set<string>();
  for (const payment of payments) {
    addPurchaseIds(payment, {
      userPackageIds,
      sessionIds,
      planIds,
      barProductIds,
    });
  }
  return {
    userPackageIds: [...userPackageIds],
    sessionIds: [...sessionIds],
    planIds: [...planIds],
    barProductIds: [...barProductIds],
  };
}

export function sessionDisplayName(input: {
  title: string;
  classTypeName: string;
}): string | null {
  const title = input.title.trim();
  if (title.length > 0) {
    return title;
  }
  const classTypeName = input.classTypeName.trim();
  return classTypeName.length > 0 ? classTypeName : null;
}

/** Prefer a product name over a stored id or the generic cart label. */
export function couponPurchaseLabel(input: {
  description: string | null;
  packageName: string | null;
  className: string | null;
  barName: string | null;
}): string | null {
  const parts = [input.packageName, input.className, input.barName].filter(
    (part): part is string => part !== null && part.trim().length > 0,
  );
  if (parts.length > 0) {
    return parts.join(' · ');
  }
  return readableStoredDescription(input.description);
}

function addPurchaseIds(
  payment: CouponPurchasePayment,
  ids: {
    userPackageIds: Set<string>;
    sessionIds: Set<string>;
    planIds: Set<string>;
    barProductIds: Set<string>;
  },
): void {
  const cart = readCartCheckout(payment.metadata);
  const planId =
    readPackagePlanIdFromMetadata(payment.metadata) ??
    cart?.packagePlanId ??
    null;
  if (planId !== null) {
    ids.planIds.add(planId);
  }
  if (cart?.barProductId !== undefined) {
    ids.barProductIds.add(cart.barProductId);
  }
  if (cart?.sessionId !== undefined) {
    ids.sessionIds.add(cart.sessionId);
  }
  if (payment.source === 'PACKAGE' && payment.sourceId !== null) {
    ids.userPackageIds.add(payment.sourceId);
  }
  if (payment.source === 'DROPIN' && payment.sourceId !== null) {
    ids.sessionIds.add(payment.sourceId);
  }
}

function readableStoredDescription(description: string | null): string | null {
  const trimmed = description?.trim() ?? '';
  if (
    trimmed.length === 0 ||
    trimmed === STUDIO_CART_DESCRIPTION ||
    DROP_IN_ID_DESCRIPTION.test(trimmed) ||
    PACKAGE_ID_DESCRIPTION.test(trimmed)
  ) {
    return null;
  }
  return trimmed;
}
