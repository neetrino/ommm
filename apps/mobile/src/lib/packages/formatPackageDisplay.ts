import type { PublicPackagePlan } from "./publicPackagePlan";
import { resolvePublicPackageFinalPriceCents } from "./publicPackagePlan";
import { formatPackageValidityDays } from "./packagesCopy";

const AMD_SYMBOL = "֏";

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
): string {
  const normalizedName = planName.trim();
  if (normalizedName.length === 0) {
    if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
      return "Session";
    }
    return sessionsPerMonth === 1 ? "1 Session" : `${sessionsPerMonth} Sessions`;
  }
  if (sessionsPerMonth === null || sessionsPerMonth <= 0) {
    return normalizedName;
  }
  return normalizedName;
}

export function formatPackageSessionsLabel(plan: PublicPackagePlan): string {
  if (plan.isUnlimited) {
    return "Unlimited sessions";
  }
  if (typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0) {
    return plan.sessionsPerMonth === 1
      ? "1 session"
      : `${plan.sessionsPerMonth} sessions`;
  }
  return "Sessions included";
}

export function formatPackageValidityLabel(plan: PublicPackagePlan): string | null {
  if (plan.periodDays <= 0) {
    return null;
  }
  return formatPackageValidityDays(plan.periodDays);
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

export function formatPackagePricePerSession(plan: PublicPackagePlan): string | null {
  if (plan.isUnlimited || plan.showPricePerSession === false) {
    return null;
  }
  if (typeof plan.pricePerSessionCents === "number" && plan.pricePerSessionCents > 0) {
    return `${formatAmdFromCents(plan.pricePerSessionCents)} / session`;
  }
  const sessions =
    typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0
      ? plan.sessionsPerMonth
      : null;
  if (sessions === null) {
    return null;
  }
  const perSession = resolvePublicPackageFinalPriceCents(plan) / sessions;
  return `${formatAmdFromCents(Math.round(perSession))} / session`;
}
