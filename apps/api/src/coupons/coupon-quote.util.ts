import { BadRequestException } from '@nestjs/common';
import {
  CouponRedemptionStatus,
  type Coupon,
  type Prisma,
} from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { COUPON_ERROR } from './coupon.constants';
import { quoteCouponDiscount } from './coupon-discount.util';
import { purchaseMatchesCouponProducts } from './coupon-eligibility.util';
import { normalizeCouponCode } from './coupon-code.util';
import type {
  CouponPurchaseLine,
  CouponSnapshot,
  CouponUsageCounts,
} from './coupon.types';

const OPEN_REDEMPTION = [
  CouponRedemptionStatus.RESERVED,
  CouponRedemptionStatus.APPLIED,
] as const;

type CouponWithRules = Coupon & {
  eligibleUsers: { userId: string }[];
  eligibleProducts: { productKind: CouponPurchaseLine['kind']; packagePlanId: string | null }[];
};

type CouponQuoteDb = PrismaService | Prisma.TransactionClient;

export async function quoteCoupon(
  db: CouponQuoteDb,
  input: {
    userId: string;
    code: string | null | undefined;
    subtotalCents: number;
    lines: readonly CouponPurchaseLine[];
    now?: Date;
    /** Caller's own unpaid payments for this same checkout, so a retry is not blocked by itself. */
    excludePaymentIds?: readonly string[];
  },
): Promise<CouponSnapshot | null> {
  const code = normalizeCouponCode(input.code);
  if (code === null) {
    return null;
  }
  if (input.subtotalCents <= 0) {
    throw new BadRequestException(COUPON_ERROR.NOT_APPLICABLE);
  }
  const coupon = await db.coupon.findUnique({
    where: { code },
    include: {
      eligibleUsers: { select: { userId: true } },
      eligibleProducts: { select: { productKind: true, packagePlanId: true } },
    },
  });
  if (coupon === null) {
    throw new BadRequestException(COUPON_ERROR.INVALID);
  }
  const now = input.now ?? new Date();
  assertCouponWindow(coupon, now);
  assertCouponAudience(coupon, input.userId, input.lines);
  const counts = await countOpenRedemptions(
    db,
    coupon.id,
    input.userId,
    input.excludePaymentIds,
  );
  assertCouponLimits(coupon, counts);
  return snapshotFromCoupon(coupon, input.subtotalCents);
}

export async function countOpenRedemptions(
  db: CouponQuoteDb,
  couponId: string,
  userId: string,
  excludePaymentIds?: readonly string[],
): Promise<CouponUsageCounts> {
  const [totalUsed, userUsed] = await Promise.all([
    db.couponRedemption.count({
      where: openRedemptionWhere(couponId, undefined, excludePaymentIds),
    }),
    db.couponRedemption.count({
      where: openRedemptionWhere(couponId, userId, excludePaymentIds),
    }),
  ]);
  return { totalUsed, userUsed };
}

function openRedemptionWhere(
  couponId: string,
  userId: string | undefined,
  excludePaymentIds: readonly string[] | undefined,
): Prisma.CouponRedemptionWhereInput {
  const excluded = excludePaymentIds ?? [];
  return {
    couponId,
    ...(userId === undefined ? {} : { userId }),
    status: { in: [...OPEN_REDEMPTION] },
    ...(excluded.length === 0 ? {} : { paymentId: { notIn: [...excluded] } }),
  };
}

export function assertCouponLimits(
  coupon: Pick<Coupon, 'totalUsageLimit' | 'usageLimitPerUser'>,
  counts: CouponUsageCounts,
): void {
  if (coupon.totalUsageLimit !== null && counts.totalUsed >= coupon.totalUsageLimit) {
    throw new BadRequestException(COUPON_ERROR.USAGE_LIMIT);
  }
  if (
    coupon.usageLimitPerUser !== null &&
    counts.userUsed >= coupon.usageLimitPerUser
  ) {
    throw new BadRequestException(COUPON_ERROR.USER_LIMIT);
  }
}

export function assertCouponWindow(
  coupon: Pick<Coupon, 'status' | 'validFrom' | 'validUntil'>,
  now: Date,
): void {
  if (coupon.status !== 'ACTIVE') {
    throw new BadRequestException(COUPON_ERROR.NOT_ACTIVE);
  }
  if (coupon.validFrom !== null && coupon.validFrom.getTime() > now.getTime()) {
    throw new BadRequestException(COUPON_ERROR.NOT_ACTIVE);
  }
  if (coupon.validUntil !== null && coupon.validUntil.getTime() < now.getTime()) {
    throw new BadRequestException(COUPON_ERROR.EXPIRED);
  }
}

function assertCouponAudience(
  coupon: CouponWithRules,
  userId: string,
  lines: readonly CouponPurchaseLine[],
): void {
  if (
    !coupon.eligibleAllUsers &&
    !coupon.eligibleUsers.some((row) => row.userId === userId)
  ) {
    throw new BadRequestException(COUPON_ERROR.NOT_FOR_USER);
  }
  const applicable = purchaseMatchesCouponProducts({
    eligibleAllProducts: coupon.eligibleAllProducts,
    rules: coupon.eligibleProducts,
    lines,
  });
  if (!applicable) {
    throw new BadRequestException(COUPON_ERROR.NOT_APPLICABLE);
  }
}

function snapshotFromCoupon(coupon: Coupon, subtotalCents: number): CouponSnapshot {
  const priced = quoteCouponDiscount({
    subtotalCents,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
  return {
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    createdById: coupon.createdById,
    originalAmountCents: Math.max(0, Math.floor(subtotalCents)),
    discountAmountCents: priced.discountCents,
    remainderGiftCents: priced.remainderGiftCents,
    amountAfterCouponCents: priced.amountAfterCouponCents,
  };
}
