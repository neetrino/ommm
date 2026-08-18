import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { resolvePackageDurationMonths } from "@/components/admin/admin-package-form-utils";
import { formatAmdFromCents } from "@/lib/price-amd";
import { formatDateForUi } from "@/lib/date-display";

const MIN_SESSIONS_FOR_PER_SESSION_PRICE = 2;

/** Shared row shape for admin and public package tables. */
export type PackageTableDisplayRow = Pick<
  AdminPackageRow,
  | "priceCents"
  | "discountedPriceCents"
  | "pricePerSessionCents"
  | "showPricePerSession"
  | "periodDays"
  | "sessionsPerMonth"
  | "isUnlimited"
  | "guestCount"
  | "freezeAllowedCount"
  | "freezeMaxDaysPerUse"
>;

type ValidityLabels = {
  days: (count: number) => string;
  months: (count: number) => string;
};

/** Formats plan validity for the packages table (e.g. "40 Days"). */
export function formatPackageValidityLabel(
  pkg: PackageTableDisplayRow,
  labels: ValidityLabels,
): string {
  if (pkg.periodDays <= 0) {
    return labels.days(0);
  }
  return labels.days(pkg.periodDays);
}

/** Calendar start date for the packages table; null when unset. */
export function formatPackageStartDateLabel(
  pkg: Pick<AdminPackageRow, "startDate">,
): string | null {
  const value = pkg.startDate;
  if (value === null || value === undefined || value.trim().length === 0) {
    return null;
  }
  const formatted = formatDateForUi(value);
  return formatted.length > 0 ? formatted : null;
}

/** Session count for the packages table; null when unset. */
export function formatPackageSessionsLabel(pkg: PackageTableDisplayRow): number | null {
  if (pkg.isUnlimited) {
    return null;
  }
  if (pkg.showPricePerSession === false) {
    return null;
  }
  const sessions = pkg.sessionsPerMonth;
  if (sessions !== null && sessions > 0) {
    return sessions;
  }
  return null;
}

/** Price per session — uses stored value when set, otherwise total divided by sessions. */
export function formatPackagePricePerSession(
  pkg: PackageTableDisplayRow,
  locale: string,
): string | null {
  if (pkg.isUnlimited) {
    return null;
  }
  if (typeof pkg.pricePerSessionCents === "number" && pkg.pricePerSessionCents > 0) {
    return formatAmdFromCents(pkg.pricePerSessionCents, locale);
  }
  const effectivePriceCents =
    typeof pkg.discountedPriceCents === "number" &&
    pkg.discountedPriceCents > 0 &&
    pkg.discountedPriceCents < pkg.priceCents
      ? pkg.discountedPriceCents
      : pkg.priceCents;
  const sessions = pkg.sessionsPerMonth;
  if (sessions !== null && sessions >= MIN_SESSIONS_FOR_PER_SESSION_PRICE) {
    return formatAmdFromCents(Math.round(effectivePriceCents / sessions), locale);
  }
  const months = resolvePackageDurationMonths(pkg.periodDays);
  if (months >= 1) {
    return formatAmdFromCents(Math.round(effectivePriceCents / months), locale);
  }
  return null;
}

export function formatPackagePriceLabel(pkg: PackageTableDisplayRow, locale: string): string {
  const payablePriceCents =
    typeof pkg.discountedPriceCents === "number" &&
    pkg.discountedPriceCents > 0 &&
    pkg.discountedPriceCents < pkg.priceCents
      ? pkg.discountedPriceCents
      : pkg.priceCents;
  return formatAmdFromCents(payablePriceCents, locale);
}

export function formatPackagePlanName(
  planName: string,
  sessionsPerMonth: number | null,
): string {
  const normalizedName = planName.trim();
  if (normalizedName.length === 0) {
    if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
      return "Session";
    }
    return sessionsPerMonth === 1
      ? "1 Session"
      : `${sessionsPerMonth} Sessions`;
  }
  if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
    return normalizedName;
  }

  return normalizedName
    .replace(new RegExp(`\\s+[–—-]\\s+${sessionsPerMonth}$`), "")
    .trim();
}

/** Remaining purchasable units for admin table; null when unlimited. */
export function formatPackageStockCount(
  pkg: Pick<AdminPackageRow, "availableQuantity">,
): number | null {
  const count = pkg.availableQuantity;
  if (count === null || count === undefined) {
    return null;
  }
  if (!Number.isInteger(count) || count < 0) {
    return null;
  }
  return count;
}

/** Guest count for the packages table; null when zero or unset. */
export function formatPackageGuestCount(pkg: PackageTableDisplayRow): number | null {
  const count = pkg.guestCount ?? 0;
  if (!Number.isInteger(count) || count <= 0) {
    return null;
  }
  return count;
}

/** Freeze policy for tables; null when times or days are unset. */
export function formatPackageFreezeLabel(
  pkg: Pick<PackageTableDisplayRow, "freezeAllowedCount" | "freezeMaxDaysPerUse">,
  labels: { timesDays: (times: number, days: number) => string },
): string | null {
  const times = pkg.freezeAllowedCount ?? 0;
  const days = pkg.freezeMaxDaysPerUse ?? 0;
  if (!Number.isInteger(times) || !Number.isInteger(days) || times <= 0 || days <= 0) {
    return null;
  }
  return labels.timesDays(times, days);
}
