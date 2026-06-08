import type { PackageTableDisplayRow } from "@/components/admin/admin-packages-display";
import { formatAmdAmount } from "@/lib/price-amd";

/** Minimum sessions before showing the days-limit column (e.g. 12-pack, not 2-pack). */
const MIN_SESSIONS_FOR_DAYS_LIMIT = 3;

export type PublicPackageTierPlan = PackageTableDisplayRow & {
  name?: string;
};

type TierSessionsLabel = {
  unlimited: string;
  count: (values: { count: number }) => string;
};

function parseSessionCountFromPlanName(name: string): number | null {
  const match = name.match(/(\d+)\s*sessions?\b/i);
  if (match === null) {
    return null;
  }
  const count = Number.parseInt(match[1], 10);
  return Number.isFinite(count) && count > 0 ? count : null;
}

/** Resolves session count for tier row (field, plan name, then default). */
export function resolvePublicPackageTierSessionCount(plan: PublicPackageTierPlan): number {
  if (plan.isUnlimited) {
    return 0;
  }

  const fromField =
    typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0
      ? plan.sessionsPerMonth
      : null;
  const fromName =
    typeof plan.name === "string" && plan.name.trim().length > 0
      ? parseSessionCountFromPlanName(plan.name)
      : null;

  if (fromField !== null && fromName !== null) {
    return Math.max(fromField, fromName);
  }
  if (fromField !== null) {
    return fromField;
  }
  if (fromName !== null) {
    return fromName;
  }
  return 1;
}

/** Session headline for tier row — e.g. "2 Sessions". */
export function formatPublicPackageTierSessionsHeadline(
  plan: PublicPackageTierPlan,
  labels: TierSessionsLabel,
): string {
  if (plan.isUnlimited) {
    return labels.unlimited;
  }
  return labels.count({ count: resolvePublicPackageTierSessionCount(plan) });
}

/** Price per session for tier row; always shown when session count is known. */
export function formatPublicPackageTierPricePerSession(
  plan: PublicPackageTierPlan,
  locale: string,
): string | null {
  void locale;
  if (plan.isUnlimited) {
    return null;
  }
  const sessions = resolvePublicPackageTierSessionCount(plan);
  if (sessions < 1) {
    return null;
  }
  const perSession = plan.priceCents / sessions;
  const hasFraction = Math.abs(perSession - Math.round(perSession)) > 0.001;
  return formatAmdAmount(perSession, {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/** Validity label for table/detail; null when no days limit (e.g. 1-session Dances tier). */
export function formatPublicPackageValidityLabel(
  plan: PublicPackageTierPlan,
  labels: {
    days: (count: number) => string;
    months: (count: number) => string;
  },
): string | null {
  if (plan.periodDays <= 0) {
    return null;
  }
  return labels.days(plan.periodDays);
}

/** Whether to show the days-limit column (bulk tiers such as 12 sessions). */
export function shouldShowPublicPackageTierDaysLimit(plan: PublicPackageTierPlan): boolean {
  if (plan.periodDays <= 0) {
    return false;
  }
  if (plan.isUnlimited) {
    return true;
  }
  const sessions = resolvePublicPackageTierSessionCount(plan);
  return sessions >= MIN_SESSIONS_FOR_DAYS_LIMIT;
}
