import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { resolvePackageDurationMonths } from "@/components/admin/admin-package-form-utils";
import { formatAmdFromCents } from "@/lib/price-amd";

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
  const months = resolvePackageDurationMonths(pkg.periodDays);
  if (months > 0) {
    return labels.months(months);
  }
  return labels.days(pkg.periodDays);
}

/** Session count for the packages table; null when unset. */
export function formatPackageSessionsLabel(pkg: AdminPackageRow): number | null {
  if (pkg.isUnlimited) {
    return null;
  }
  const sessions = pkg.sessionsPerMonth;
  if (sessions !== null && sessions > 0) {
    return sessions;
  }
  return null;
}

/** Price per session — total price divided by session count when available. */
export function formatPackagePricePerSession(
  pkg: AdminPackageRow,
  locale: string,
): string | null {
  if (pkg.isUnlimited) {
    return null;
  }
  const sessions = pkg.sessionsPerMonth;
  if (sessions !== null && sessions >= MIN_SESSIONS_FOR_PER_SESSION_PRICE) {
    return formatAmdFromCents(Math.round(pkg.priceCents / sessions), locale);
  }
  const months = resolvePackageDurationMonths(pkg.periodDays);
  if (months >= 1) {
    return formatAmdFromCents(Math.round(pkg.priceCents / months), locale);
  }
  return null;
}

export function formatPackagePriceLabel(pkg: AdminPackageRow, locale: string): string {
  return formatAmdFromCents(pkg.priceCents, locale);
}

/** Guest count for the packages table; null when zero or unset. */
export function formatPackageGuestCount(pkg: AdminPackageRow): number | null {
  const count = pkg.guestCount ?? 0;
  if (!Number.isInteger(count) || count <= 0) {
    return null;
  }
  return count;
}
