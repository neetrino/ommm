import type { Prisma } from '@prisma/client';

export const PACKAGE_GIFT_CREDITS_APPLIED_KEY = 'giftCreditsAppliedCents';
export const PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY = 'giftCreditsAllocations';
export const PACKAGE_GIFT_CREDITS_REFUNDED_KEY = 'giftCreditsRefunded';

/** One debit from a gift card (`cardId`) or legacy wallet (`cardId: null`). */
export type GiftCreditAllocation = {
  cardId: string | null;
  cents: number;
};

export function readGiftCreditsAppliedCents(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): number {
  const record = asMetadataRecord(metadata);
  if (record === null) {
    return 0;
  }
  const value = record[PACKAGE_GIFT_CREDITS_APPLIED_KEY];
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

export function readGiftCreditsAllocations(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): GiftCreditAllocation[] | null {
  const record = asMetadataRecord(metadata);
  if (record === null) {
    return null;
  }
  const raw = record[PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY];
  if (!Array.isArray(raw)) {
    return null;
  }
  return parseAllocations(raw);
}

/** Card ids actually reserved on a payment. Wallet rows are omitted. */
export function reservedGiftCardIds(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): string[] {
  const allocations = readGiftCreditsAllocations(metadata) ?? [];
  return allocations
    .flatMap((row) => (row.cardId === null ? [] : [row.cardId]))
    .sort();
}

/** `requested` omitted keeps older checkouts that did not choose cards. */
export function sameGiftCardSelection(
  existing: readonly string[],
  requested: readonly string[] | undefined,
): boolean {
  if (requested === undefined) {
    return true;
  }
  const left = [...existing].sort();
  const right = [...new Set(requested)].sort();
  if (left.length !== right.length) {
    return false;
  }
  return left.every((id, index) => id === right[index]);
}

export function wereGiftCreditsRefunded(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): boolean {
  const record = asMetadataRecord(metadata);
  return record?.[PACKAGE_GIFT_CREDITS_REFUNDED_KEY] === true;
}

function parseAllocations(raw: unknown[]): GiftCreditAllocation[] | null {
  const allocations: GiftCreditAllocation[] = [];
  for (const entry of raw) {
    const parsed = parseAllocation(entry);
    if (parsed !== null) {
      allocations.push(parsed);
    }
  }
  return allocations.length > 0 ? allocations : null;
}

function parseAllocation(entry: unknown): GiftCreditAllocation | null {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    return null;
  }
  const row = entry as Record<string, unknown>;
  const cents =
    typeof row.cents === 'number' && Number.isFinite(row.cents)
      ? Math.floor(row.cents)
      : 0;
  if (cents <= 0) {
    return null;
  }
  if (typeof row.cardId === 'string' || row.cardId === null) {
    return { cardId: row.cardId, cents };
  }
  return null;
}

function asMetadataRecord(
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
