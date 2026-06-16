import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { formatCombinedSessionsBreakdown } from "@/components/admin/admin-combined-tier-session-allocations.util";
import { resolvePackageDurationMonths } from "@/components/admin/admin-package-form-utils";
import { formatAmdFromCents } from "@/lib/price-amd";

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
  | "planType"
  | "combinedComponents"
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

/** Per-source session breakdown for combined pricing tiers. */
export function formatCombinedPackageSessionsBreakdown(
  pkg: PackageTableDisplayRow,
): string | null {
  if (pkg.planType !== "COMBINED") {
    return null;
  }
  return formatCombinedSessionsBreakdown(pkg.combinedComponents);
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
  if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
    return normalizedName;
  }

  return normalizedName
    .replace(new RegExp(`\\s+[–—-]\\s+${sessionsPerMonth}$`), "")
    .trim();
}

/** Guest count for the packages table; null when zero or unset. */
export function formatPackageGuestCount(pkg: PackageTableDisplayRow): number | null {
  const count = pkg.guestCount ?? 0;
  if (!Number.isInteger(count) || count <= 0) {
    return null;
  }
  return count;
}
