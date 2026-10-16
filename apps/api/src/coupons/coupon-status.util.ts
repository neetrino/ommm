import type { CouponStatus } from '@prisma/client';

export type CouponDisplayStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'DISABLED'
  | 'USAGE_LIMIT_REACHED';

export function deriveCouponDisplayStatus(input: {
  status: CouponStatus;
  validUntil: Date | null;
  totalUsageLimit: number | null;
  usedCount: number;
  now: Date;
}): CouponDisplayStatus {
  if (input.status === 'DRAFT') {
    return 'DRAFT';
  }
  if (input.status === 'DISABLED') {
    return 'DISABLED';
  }
  if (
    input.validUntil !== null &&
    input.validUntil.getTime() < input.now.getTime()
  ) {
    return 'EXPIRED';
  }
  if (
    input.totalUsageLimit !== null &&
    input.usedCount >= input.totalUsageLimit
  ) {
    return 'USAGE_LIMIT_REACHED';
  }
  return 'ACTIVE';
}

export function remainingCouponUses(
  totalUsageLimit: number | null,
  usedCount: number,
): number | null {
  if (totalUsageLimit === null) {
    return null;
  }
  return Math.max(0, totalUsageLimit - usedCount);
}
