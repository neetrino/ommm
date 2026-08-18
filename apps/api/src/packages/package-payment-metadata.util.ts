import type { Prisma } from '@prisma/client';

export const PACKAGE_PAYMENT_PLAN_ID_KEY = 'planId';

/** Reads `planId` stored on a PACKAGE payment before UserPackage exists. */
export function readPackagePlanIdFromMetadata(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): string | null {
  if (
    metadata === null ||
    metadata === undefined ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null;
  }
  const value = (metadata as Record<string, unknown>)[
    PACKAGE_PAYMENT_PLAN_ID_KEY
  ];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

/** Merges `planId` onto payment metadata without dropping Arca fields. */
export function withPackagePlanIdMetadata(
  existing: Prisma.JsonValue | null | undefined,
  planId: string,
  extra?: Record<string, unknown>,
): Prisma.InputJsonValue {
  const base =
    existing !== null &&
    existing !== undefined &&
    typeof existing === 'object' &&
    !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  return {
    ...base,
    ...(extra ?? {}),
    [PACKAGE_PAYMENT_PLAN_ID_KEY]: planId,
  };
}
