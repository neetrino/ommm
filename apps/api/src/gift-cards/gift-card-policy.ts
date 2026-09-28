/** Whole AMD. Matches the current custom-gift floor until studio settings override it. */
export const GIFT_CARD_MIN_AMOUNT_AMD = 30_000;

/** Safety cap for a member-chosen gift amount. */
export const GIFT_CARD_MAX_AMOUNT_AMD = 1_000_000;

/** Ready-made amounts from the gift-card brief. "Other" stays a free amount. */
export const GIFT_CARD_DENOMINATIONS_AMD = [40_000, 70_000, 100_000] as const;

/** Applied when a card is issued without an explicit expiry. */
export const GIFT_CARD_DEFAULT_VALIDITY_MONTHS = 12;

export const GIFT_CARD_DEBIT_ATTEMPTS = 3;

export const GIFT_CARD_EXPIRE_BATCH = 100;

const MIN_VALIDITY_MONTHS = 1;
const MAX_VALIDITY_MONTHS = 60;

export type GiftCardPolicy = {
  minAmountAmd: number;
  maxAmountAmd: number;
  denominationsAmd: number[];
  validityMonths: number;
};

export type GiftCardPolicyRow = {
  giftCardMinAmountAmd: number;
  giftCardValidityMonths: number;
  giftCardDenominationsJson: string;
} | null;

export function defaultGiftCardExpiresAt(
  from: Date,
  validityMonths = GIFT_CARD_DEFAULT_VALIDITY_MONTHS,
): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + validityMonths);
  return next;
}

/** Cards with no expiry are spent after every dated card. Then oldest first. */
export function compareGiftCardsForSpend(
  a: { expiresAt: Date | null; createdAt?: Date | null },
  b: { expiresAt: Date | null; createdAt?: Date | null },
): number {
  const aExpiry = a.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
  const bExpiry = b.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
  if (aExpiry !== bExpiry) {
    return aExpiry - bExpiry;
  }
  return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
}

export function resolveGiftCardPolicy(row: GiftCardPolicyRow): GiftCardPolicy {
  const minAmountAmd = positiveInt(row?.giftCardMinAmountAmd, GIFT_CARD_MIN_AMOUNT_AMD);
  const validityMonths = clampInt(
    row?.giftCardValidityMonths,
    GIFT_CARD_DEFAULT_VALIDITY_MONTHS,
    MIN_VALIDITY_MONTHS,
    MAX_VALIDITY_MONTHS,
  );
  return {
    minAmountAmd,
    maxAmountAmd: GIFT_CARD_MAX_AMOUNT_AMD,
    denominationsAmd: parseDenominations(row?.giftCardDenominationsJson, minAmountAmd),
    validityMonths,
  };
}

function parseDenominations(raw: string | undefined, minAmountAmd: number): number[] {
  if (raw === undefined) {
    return [...GIFT_CARD_DENOMINATIONS_AMD];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...GIFT_CARD_DENOMINATIONS_AMD];
    }
    const amounts = parsed.filter(
      (value): value is number =>
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= minAmountAmd &&
        value <= GIFT_CARD_MAX_AMOUNT_AMD,
    );
    return amounts.length > 0 ? amounts : [...GIFT_CARD_DENOMINATIONS_AMD];
  } catch {
    return [...GIFT_CARD_DENOMINATIONS_AMD];
  }
}

function positiveInt(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isInteger(value) || value < 1) {
    return fallback;
  }
  return value;
}

function clampInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const resolved = positiveInt(value, fallback);
  return Math.min(max, Math.max(min, resolved));
}
