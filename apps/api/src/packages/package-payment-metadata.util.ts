import type { Prisma } from '@prisma/client';

export const PACKAGE_PAYMENT_PLAN_ID_KEY = 'planId';
export const STUDIO_PACKAGE_FULFILLED_KEY = 'studioPackageFulfilled';
/** Class the member was trying to book when they bought this package. */
export const PACKAGE_BOOK_SESSION_ID_KEY = 'bookSessionId';

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

function readMetadataRecord(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): Record<string, unknown> | null {
  if (
    metadata === null ||
    metadata === undefined ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null;
  }
  return metadata as Record<string, unknown>;
}

/** Class session stored on a package payment that started from Book. */
export function readBookSessionIdFromMetadata(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): string | null {
  const record = readMetadataRecord(metadata);
  if (record === null) {
    return null;
  }
  const value = record[PACKAGE_BOOK_SESSION_ID_KEY];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

/** Merges the class to book onto package payment metadata. */
export function withBookSessionIdMetadata(
  existing: Prisma.JsonValue | null | undefined,
  sessionId: string,
): Prisma.InputJsonValue {
  const base = readMetadataRecord(existing) ?? {};
  return {
    ...base,
    [PACKAGE_BOOK_SESSION_ID_KEY]: sessionId,
  };
}

export function isStudioPackageFulfilled(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): boolean {
  if (
    metadata === null ||
    metadata === undefined ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return false;
  }
  return (
    (metadata as Record<string, unknown>)[STUDIO_PACKAGE_FULFILLED_KEY] === true
  );
}
