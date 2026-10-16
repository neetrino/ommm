import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { COUPON_ERROR } from './coupon.constants';
import { withCouponMetadata } from './coupon-metadata.util';
import {
  assertCouponLimits,
  assertCouponWindow,
  countOpenRedemptions,
} from './coupon-quote.util';
import type { CouponSnapshot } from './coupon.types';

type RedemptionDb = Prisma.TransactionClient;

export async function bindCouponRedemption(
  tx: RedemptionDb,
  input: {
    userId: string;
    paymentId: string;
    snapshot: CouponSnapshot | null;
    applyNow: boolean;
  },
): Promise<void> {
  if (input.snapshot === null) {
    return;
  }
  await reserveCouponRedemption(tx, {
    userId: input.userId,
    paymentId: input.paymentId,
    snapshot: input.snapshot,
  });
  if (input.applyNow) {
    await applyReservedCoupon(tx, input.paymentId);
  }
}

/** Locks the coupon row, reserves one use, and stores the historical snapshot. */
export async function reserveCouponRedemption(
  tx: RedemptionDb,
  input: { userId: string; paymentId: string; snapshot: CouponSnapshot },
): Promise<void> {
  await tx.$executeRaw(
    Prisma.sql`SELECT "id" FROM "Coupon" WHERE "id" = ${input.snapshot.couponId} FOR UPDATE`,
  );
  const coupon = await tx.coupon.findUnique({
    where: { id: input.snapshot.couponId },
    select: {
      id: true,
      totalUsageLimit: true,
      usageLimitPerUser: true,
      status: true,
      validFrom: true,
      validUntil: true,
    },
  });
  if (coupon === null) {
    throw new BadRequestException(COUPON_ERROR.NOT_ACTIVE);
  }
  assertCouponWindow(coupon, new Date());
  const counts = await countOpenRedemptions(tx, coupon.id, input.userId);
  assertCouponLimits(coupon, counts);
  await tx.couponRedemption.create({
    data: {
      couponId: coupon.id,
      userId: input.userId,
      paymentId: input.paymentId,
      code: input.snapshot.code,
      discountType: input.snapshot.discountType,
      discountValue: input.snapshot.discountValue,
      originalAmountCents: input.snapshot.originalAmountCents,
      discountAmountCents: input.snapshot.discountAmountCents,
      remainderGiftCents: input.snapshot.remainderGiftCents,
      finalAmountCents: input.snapshot.amountAfterCouponCents,
      createdById: input.snapshot.createdById,
    },
  });
  const payment = await tx.payment.findUnique({
    where: { id: input.paymentId },
    select: { metadata: true },
  });
  await tx.payment.update({
    where: { id: input.paymentId },
    data: { metadata: withCouponMetadata(payment?.metadata, input.snapshot) },
  });
}

/** Credits a fixed-coupon remainder once, when the payment actually succeeds. */
export async function applyReservedCoupon(
  tx: RedemptionDb,
  paymentId: string,
): Promise<void> {
  const claimed = await tx.couponRedemption.updateMany({
    where: { paymentId, status: 'RESERVED' },
    data: { status: 'APPLIED', appliedAt: new Date() },
  });
  if (claimed.count !== 1) {
    return;
  }
  const redemption = await tx.couponRedemption.findUnique({
    where: { paymentId },
    select: { userId: true, remainderGiftCents: true },
  });
  if (redemption === null || redemption.remainderGiftCents <= 0) {
    return;
  }
  await tx.user.update({
    where: { id: redemption.userId },
    data: { giftCreditsCents: { increment: redemption.remainderGiftCents } },
  });
}

/** Frees a reservation when checkout fails before the payment succeeds. */
export async function releaseReservedCoupon(
  tx: Pick<RedemptionDb, 'couponRedemption'>,
  paymentId: string,
): Promise<void> {
  await tx.couponRedemption.updateMany({
    where: { paymentId, status: 'RESERVED' },
    data: { status: 'RELEASED' },
  });
}
