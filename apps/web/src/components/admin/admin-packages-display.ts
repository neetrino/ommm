import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { formatAmdFromCents } from "@/lib/price-amd";

const DAYS_PER_MONTH = 30;
const MIN_SESSIONS_FOR_PER_SESSION_PRICE = 2;

type ValidityLabels = {
  days: (count: number) => string;
  months: (count: number) => string;
};

/** Formats plan validity for the packages table (Figma "40 Days" / "6 Months"). */
export function formatPackageValidityLabel(
  pkg: AdminPackageRow,
  labels: ValidityLabels,
): string {
  if (pkg.periodDays >= DAYS_PER_MONTH && pkg.periodDays % DAYS_PER_MONTH === 0) {
    return labels.months(pkg.periodDays / DAYS_PER_MONTH);
  }
  return labels.days(pkg.periodDays);
}

/** Per-session price when the plan includes multiple sessions. */
export function formatPackagePricePerSession(
  pkg: AdminPackageRow,
  locale: string,
): string | null {
  if (pkg.isUnlimited) {
    return null;
  }
  const sessions = pkg.sessionsPerMonth;
  if (sessions === null || sessions < MIN_SESSIONS_FOR_PER_SESSION_PRICE) {
    return null;
  }
  return formatAmdFromCents(Math.round(pkg.priceCents / sessions), locale);
}

export function formatPackagePriceLabel(pkg: AdminPackageRow, locale: string): string {
  return formatAmdFromCents(pkg.priceCents, locale);
}
