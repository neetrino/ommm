import type { PublicPackagePlan } from "./publicPackagePlan";
import { resolvePublicPackageFinalPriceCents } from "./publicPackagePlan";

const AMD_SYMBOL = "֏";

export type PackageDisplayCopy = {
  sessionFallback: string;
  sessionCountLabel: (count: number) => string;
  unlimitedSessions: string;
  sessionsIncluded: string;
  perSessionSuffix: string;
};

function formatAmdFromCents(cents: number): string {
  const amount = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(cents));
  return `${amount} ${AMD_SYMBOL}`;
}

export function formatPackagePriceLabel(plan: {
  priceCents: number;
  discountedPriceCents?: number | null;
}): string {
  return formatAmdFromCents(resolvePublicPackageFinalPriceCents(plan));
}

export function formatPackagePlanName(
  planName: string,
  sessionsPerMonth: number | null,
  copy: PackageDisplayCopy,
): string {
  const normalizedName = planName.trim();
  if (normalizedName.length === 0) {
    if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
      return copy.sessionFallback;
    }
    return copy.sessionCountLabel(sessionsPerMonth);
  }
  if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
    return normalizedName;
  }
  return normalizedName;
}

export function formatPackageSessionsLabel(
  plan: PublicPackagePlan,
  copy: PackageDisplayCopy,
): string {
  if (plan.isUnlimited) {
    return copy.unlimitedSessions;
  }
  if (typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0) {
    return copy.sessionCountLabel(plan.sessionsPerMonth);
  }
  return copy.sessionsIncluded;
}

export function formatPackageValidityLabel(
  plan: PublicPackagePlan,
  formatDays: (count: number) => string,
): string | null {
  if (plan.periodDays <= 0) {
    return null;
  }
  return formatDays(plan.periodDays);
}

export function resolvePublicPackageTotalSessions(
  plan: PublicPackagePlan,
): number | null {
  if (plan.isUnlimited) {
    return null;
  }
  if (typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0) {
    return plan.sessionsPerMonth;
  }
  return null;
}

export function formatPackagePricePerSession(
  plan: PublicPackagePlan,
  copy: PackageDisplayCopy,
  formatCents: (cents: number) => string = formatAmdFromCents,
): string | null {
  if (plan.isUnlimited || plan.showPricePerSession === false) {
    return null;
  }
  if (typeof plan.pricePerSessionCents === "number" && plan.pricePerSessionCents > 0) {
    return `${formatCents(plan.pricePerSessionCents)} / ${copy.perSessionSuffix}`;
  }
  const sessions =
    typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0
      ? plan.sessionsPerMonth
      : null;
  if (sessions === null) {
    return null;
  }
  const perSession = resolvePublicPackageFinalPriceCents(plan) / sessions;
  return `${formatCents(Math.round(perSession))} / ${copy.perSessionSuffix}`;
}
