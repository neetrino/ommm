/** Public package plan returned by `GET /packages/plans` (active plans only). */
export type PublicPackagePlan = {
  id: string;
  name: string;
  categoryName: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
  guestCount?: number;
  displayOrder: number;
};

function coerceSessionsPerMonth(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
}

export function normalizePublicPackagePlan(plan: PublicPackagePlan): PublicPackagePlan {
  return {
    ...plan,
    categoryName:
      typeof plan.categoryName === "string" && plan.categoryName.trim().length > 0
        ? plan.categoryName.trim()
        : "General",
    sessionsPerMonth: coerceSessionsPerMonth(plan.sessionsPerMonth),
    guestCount: typeof plan.guestCount === "number" ? plan.guestCount : 0,
    features: Array.isArray(plan.features) ? plan.features : [],
  };
}
