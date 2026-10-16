import type { Prisma } from '@prisma/client';
import { mergeArcaMetadata } from '../payments/arca/arca-metadata.util';
import { COUPON_METADATA_KEY } from './coupon.constants';
import type { CouponSnapshot } from './coupon.types';

export function couponMetadataPatch(
  snapshot: CouponSnapshot,
): Record<string, CouponSnapshot> {
  return { [COUPON_METADATA_KEY]: snapshot };
}

export function readCouponSnapshot(
  metadata: Prisma.JsonValue | null | undefined,
): CouponSnapshot | null {
  if (!isRecord(metadata)) {
    return null;
  }
  const raw = metadata[COUPON_METADATA_KEY];
  if (!isRecord(raw)) {
    return null;
  }
  return parseCouponSnapshot(raw);
}

export function withCouponMetadata(
  metadata: Prisma.JsonValue | null | undefined,
  snapshot: CouponSnapshot,
): Prisma.InputJsonValue {
  return mergeArcaMetadata(metadata ?? null, couponMetadataPatch(snapshot));
}

/** Succeeded package (or package cart) checkouts cannot be refunded or failed away. */
export function couponBlocksSucceededPackageUndo(
  source: string,
  metadata: Prisma.JsonValue | null | undefined,
  currentStatus: string,
  nextStatus: string,
): boolean {
  if (!couponBlocksPackageRefund(source, metadata)) {
    return false;
  }
  if (nextStatus === 'REFUNDED') {
    return true;
  }
  return currentStatus === 'SUCCEEDED' && nextStatus === 'FAILED';
}

/** Package checkouts and carts that include a package cannot be refunded. */
export function couponBlocksPackageRefund(
  source: string,
  metadata: Prisma.JsonValue | null | undefined,
): boolean {
  if (readCouponSnapshot(metadata) === null) {
    return false;
  }
  if (source === 'PACKAGE') {
    return true;
  }
  if (source !== 'OTHER') {
    return false;
  }
  if (!isRecord(metadata)) {
    return false;
  }
  return typeof metadata.packagePlanId === 'string' && metadata.packagePlanId.length > 0;
}

function parseCouponSnapshot(raw: Record<string, unknown>): CouponSnapshot | null {
  if (
    typeof raw.couponId !== 'string' ||
    typeof raw.code !== 'string' ||
    (raw.discountType !== 'PERCENTAGE' && raw.discountType !== 'FIXED_AMOUNT') ||
    !isNonNegativeInt(raw.discountValue) ||
    typeof raw.createdById !== 'string' ||
    !isNonNegativeInt(raw.originalAmountCents) ||
    !isNonNegativeInt(raw.discountAmountCents) ||
    !isNonNegativeInt(raw.remainderGiftCents) ||
    !isNonNegativeInt(raw.amountAfterCouponCents)
  ) {
    return null;
  }
  return {
    couponId: raw.couponId,
    code: raw.code,
    discountType: raw.discountType,
    discountValue: raw.discountValue,
    createdById: raw.createdById,
    originalAmountCents: raw.originalAmountCents,
    discountAmountCents: raw.discountAmountCents,
    remainderGiftCents: raw.remainderGiftCents,
    amountAfterCouponCents: raw.amountAfterCouponCents,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
