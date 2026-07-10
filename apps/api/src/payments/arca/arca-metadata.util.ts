import type { Prisma } from '@prisma/client';

import type { ArcaPaymentMetadata } from './arca.types';

/** Safely reads the Arca-specific fields stored on `Payment.metadata`. */
export function readArcaMetadata(
  metadata: Prisma.JsonValue | null,
): ArcaPaymentMetadata {
  if (
    metadata === null ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return {};
  }

  const record = metadata as Record<string, unknown>;

  return {
    provider: record.provider === 'arca' ? 'arca' : undefined,
    arcaOrderId:
      typeof record.arcaOrderId === 'string' ? record.arcaOrderId : undefined,
    checkoutLocale:
      typeof record.checkoutLocale === 'string'
        ? record.checkoutLocale
        : undefined,
    checkoutSource:
      typeof record.checkoutSource === 'string'
        ? record.checkoutSource
        : undefined,
    arcaRegisterAttempt:
      typeof record.arcaRegisterAttempt === 'number'
        ? record.arcaRegisterAttempt
        : undefined,
  };
}

/** Merges an Arca metadata patch onto the existing `Payment.metadata` value. */
export function mergeArcaMetadata(
  existing: Prisma.JsonValue | null,
  patch: ArcaPaymentMetadata,
): Prisma.InputJsonValue {
  const base =
    existing !== null &&
    typeof existing === 'object' &&
    !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};

  return { ...base, ...patch };
}
