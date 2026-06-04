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

export function normalizePublicPackagePlan(plan: PublicPackagePlan): PublicPackagePlan {
  return {
    ...plan,
    categoryName:
      typeof plan.categoryName === "string" && plan.categoryName.trim().length > 0
        ? plan.categoryName.trim()
        : "General",
    guestCount: typeof plan.guestCount === "number" ? plan.guestCount : 0,
    features: Array.isArray(plan.features) ? plan.features : [],
  };
}
