export const MAX_NAME_LENGTH = 120;
export const MAX_CATEGORY_NAME_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_BILLING_PERIOD_LENGTH = 32;
export const PACKAGE_DAYS_PER_MONTH = 30;
export const MIN_PACKAGE_DURATION_DAYS = 1;
export const MAX_PACKAGE_DURATION_DAYS = 3600;
export const MIN_PACKAGE_GUEST_COUNT = 0;
export const MAX_PACKAGE_GUEST_COUNT = 99;
export const MIN_PACKAGE_SESSIONS = 1;
export const MAX_PACKAGE_SESSIONS = 999;

export const BILLING_PERIOD_OPTIONS = ["monthly", "session"] as const;
export type BillingPeriodOption = (typeof BILLING_PERIOD_OPTIONS)[number];

import { parseAmdMoneyInput } from "@/lib/price-amd";

export function parsePriceToCents(raw: string): number | null {
  return parseAmdMoneyInput(raw);
}

/** Hides browser increment/decrement controls on number inputs. */
export const OMMM_INPUT_NUMBER_CLASS =
  "ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function preventNumberArrowStep(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
  }
}

export function isBillingPeriodOption(value: string): value is BillingPeriodOption {
  return BILLING_PERIOD_OPTIONS.includes(value as BillingPeriodOption);
}

export function resolvePackageBillingPeriod(
  pkg: { billingPeriod: string } | undefined,
): BillingPeriodOption {
  if (pkg !== undefined && isBillingPeriodOption(pkg.billingPeriod)) {
    return pkg.billingPeriod;
  }
  return "monthly";
}

export function durationMonthsToPeriodDays(months: number): number {
  return months * PACKAGE_DAYS_PER_MONTH;
}

export function resolvePackageDurationMonths(periodDays: number): number {
  if (!Number.isFinite(periodDays) || periodDays <= 0) {
    return 0;
  }
  if (periodDays % PACKAGE_DAYS_PER_MONTH === 0) {
    return periodDays / PACKAGE_DAYS_PER_MONTH;
  }
  return Math.max(1, Math.round(periodDays / PACKAGE_DAYS_PER_MONTH));
}

export function periodDaysToFormDurationDays(periodDays: number): string {
  if (!Number.isFinite(periodDays) || periodDays <= 0) {
    return String(PACKAGE_DAYS_PER_MONTH);
  }
  return String(periodDays);
}

export function parseGuestCount(raw: string): number | null {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    return null;
  }
  const count = Number.parseInt(normalized, 10);
  if (!Number.isInteger(count)) {
    return null;
  }
  return count;
}

export function parseSessionsCount(raw: string): number | null {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    return null;
  }
  const count = Number.parseInt(normalized, 10);
  if (!Number.isInteger(count)) {
    return null;
  }
  return count;
}

/** Builds the stored plan name from session count (e.g. "1 Session", "4 Sessions"). */
export function buildPackageSessionNameFromCount(count: number): string {
  if (!Number.isInteger(count) || count <= 0) {
    return buildPackageSessionNameFromCount(MIN_PACKAGE_SESSIONS);
  }
  return count === 1 ? "1 Session" : `${count} Sessions`;
}

export function parseDurationDays(raw: string): number | null {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    return null;
  }
  const days = Number.parseInt(normalized, 10);
  if (!Number.isInteger(days)) {
    return null;
  }
  return days;
}

export type AdminPackageFormValues = {
  name: string;
  categoryName: string;
  description: string;
  price: string;
  discountedPrice: string;
  pricePerSession: string;
  durationDays: string;
  sessionsCount: string;
  guestCount: string;
  isPopular: boolean;
  isActive: boolean;
  showPricePerSession: boolean;
  sourceSessionAllocations: Record<string, string>;
};

export function createEmptyPackageFormValues(initialCategoryName = ""): AdminPackageFormValues {
  return {
    name: "",
    categoryName: initialCategoryName,
    description: "",
    price: "",
    discountedPrice: "",
    pricePerSession: "",
    durationDays: String(PACKAGE_DAYS_PER_MONTH),
    sessionsCount: "1",
    guestCount: "",
    isPopular: false,
    isActive: true,
    showPricePerSession: true,
    sourceSessionAllocations: {},
  };
}

/** Empty pricing fields for add-tier / edit-tier forms (no prefilled numbers). */
export function createEmptyTierFormValues(initialCategoryName = ""): AdminPackageFormValues {
  return {
    ...createEmptyPackageFormValues(initialCategoryName),
    price: "",
    discountedPrice: "",
    pricePerSession: "",
    durationDays: "",
    guestCount: "",
  };
}

export function packageRowToFormValues(
  pkg: {
  name: string;
  categoryName: string;
  description: string | null;
  priceCents: number;
  discountedPriceCents?: number | null;
  pricePerSessionCents?: number;
  periodDays: number;
  billingPeriod: string;
  isPopular: boolean;
  isActive: boolean;
  showPricePerSession?: boolean;
  guestCount?: number;
  sessionsPerMonth?: number | null;
},
  fallbackCategoryName = "",
): AdminPackageFormValues {
  const sessions =
    typeof pkg.sessionsPerMonth === "number" && pkg.sessionsPerMonth > 0
      ? pkg.sessionsPerMonth
      : MIN_PACKAGE_SESSIONS;
  const discountAmountCents =
    typeof pkg.discountedPriceCents === "number" &&
    pkg.discountedPriceCents >= 0 &&
    pkg.discountedPriceCents < pkg.priceCents
      ? pkg.priceCents - pkg.discountedPriceCents
      : null;
  return {
    name: pkg.name,
    categoryName: pkg.categoryName.trim().length > 0 ? pkg.categoryName : fallbackCategoryName,
    description: pkg.description ?? "",
    price: String(pkg.priceCents),
    discountedPrice: discountAmountCents !== null ? String(discountAmountCents) : "",
    pricePerSession: formatStoredPricePerSessionAmount(pkg),
    durationDays: periodDaysToFormDurationDays(pkg.periodDays),
    sessionsCount: String(sessions),
    guestCount:
      typeof pkg.guestCount === "number" && pkg.guestCount > 0 ? String(pkg.guestCount) : "",
    isPopular: pkg.isPopular,
    isActive: pkg.isActive,
    showPricePerSession:
      typeof pkg.showPricePerSession === "boolean" ? pkg.showPricePerSession : true,
    sourceSessionAllocations: {},
  };
}

/** Derives per-session AMD for tier forms from raw price and session count inputs. */
export function resolveTierPricePerSessionField(price: string, sessionsCount: string): string {
  const priceAmount = parsePriceToCents(price);
  const sessions = parseSessionsCount(sessionsCount);
  if (priceAmount === null || sessions === null) {
    return "";
  }
  return deriveTierPricePerSessionAmount(priceAmount, sessions);
}

/** Derives per-session AMD amount from stored total price and session count. */
export function deriveTierPricePerSessionAmount(priceCents: number, sessions: number): string {
  if (
    !Number.isFinite(priceCents) ||
    priceCents <= 0 ||
    !Number.isInteger(sessions) ||
    sessions <= 0
  ) {
    return "";
  }
  return String(Math.round(priceCents / sessions));
}

/** Resolves per-session amount for forms: stored value first, then derived fallback. */
export function formatStoredPricePerSessionAmount(pkg: {
  pricePerSessionCents?: number;
  priceCents: number;
  sessionsPerMonth?: number | null;
}): string {
  if (typeof pkg.pricePerSessionCents === "number" && pkg.pricePerSessionCents > 0) {
    return String(pkg.pricePerSessionCents);
  }
  const sessions =
    typeof pkg.sessionsPerMonth === "number" && pkg.sessionsPerMonth > 0
      ? pkg.sessionsPerMonth
      : MIN_PACKAGE_SESSIONS;
  return deriveTierPricePerSessionAmount(pkg.priceCents, sessions);
}

/** Maps a package row to tier form values with separate total and per-session prices. */
export function packageRowToTierFormValues(
  pkg: Parameters<typeof packageRowToFormValues>[0],
  fallbackCategoryName = "",
): AdminPackageFormValues {
  return packageRowToFormValues(pkg, fallbackCategoryName);
}
