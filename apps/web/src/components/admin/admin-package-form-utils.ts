export const MAX_NAME_LENGTH = 120;
export const MAX_CATEGORY_NAME_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_BILLING_PERIOD_LENGTH = 32;
export const PACKAGE_DAYS_PER_MONTH = 30;
export const MIN_PACKAGE_DURATION_MONTHS = 1;
export const MAX_PACKAGE_DURATION_MONTHS = 120;
export const MIN_PACKAGE_GUEST_COUNT = 1;
export const MAX_PACKAGE_GUEST_COUNT = 99;

export const BILLING_PERIOD_OPTIONS = ["monthly", "session"] as const;
export type BillingPeriodOption = (typeof BILLING_PERIOD_OPTIONS)[number];

export function parsePriceToCents(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized.length === 0) {
    return null;
  }
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.round(numeric * 100);
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
  return Math.max(
    MIN_PACKAGE_DURATION_MONTHS,
    Math.round(periodDays / PACKAGE_DAYS_PER_MONTH),
  );
}

export function periodDaysToDurationMonths(periodDays: number): string {
  const months = resolvePackageDurationMonths(periodDays);
  if (months <= 0) {
    return String(MIN_PACKAGE_DURATION_MONTHS);
  }
  return String(months);
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

export function parseDurationMonths(raw: string): number | null {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    return null;
  }
  const months = Number.parseInt(normalized, 10);
  if (!Number.isInteger(months)) {
    return null;
  }
  return months;
}

export type AdminPackageFormValues = {
  name: string;
  categoryName: string;
  description: string;
  price: string;
  durationMonths: string;
  guestCount: string;
  billingPeriod: BillingPeriodOption;
  isPopular: boolean;
  isActive: boolean;
};

export function createEmptyPackageFormValues(initialCategoryName = ""): AdminPackageFormValues {
  return {
    name: "",
    categoryName: initialCategoryName,
    description: "",
    price: "",
    durationMonths: "1",
    guestCount: "1",
    billingPeriod: "monthly",
    isPopular: false,
    isActive: true,
  };
}

export function packageRowToFormValues(
  pkg: {
  name: string;
  categoryName: string;
  description: string | null;
  priceCents: number;
  periodDays: number;
  billingPeriod: string;
  isPopular: boolean;
  isActive: boolean;
  guestCount?: number;
},
  fallbackCategoryName = "",
): AdminPackageFormValues {
  const billingPeriod = isBillingPeriodOption(pkg.billingPeriod) ? pkg.billingPeriod : "monthly";
  return {
    name: pkg.name,
    categoryName: pkg.categoryName.trim().length > 0 ? pkg.categoryName : fallbackCategoryName,
    description: pkg.description ?? "",
    price: (pkg.priceCents / 100).toFixed(2),
    durationMonths: periodDaysToDurationMonths(pkg.periodDays),
    guestCount: String(
      typeof pkg.guestCount === "number" && pkg.guestCount >= 0 ? pkg.guestCount : 0,
    ),
    billingPeriod,
    isPopular: pkg.isPopular,
    isActive: pkg.isActive,
  };
}
