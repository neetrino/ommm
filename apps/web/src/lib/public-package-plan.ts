/** Public package plan returned by `GET /packages/plans` (active plans only). */
export type PublicPackagePlan = {
  id: string;
  name: string;
  categoryName: string;
  description: string | null;
  priceCents: number;
  discountedPriceCents?: number | null;
  finalPriceCents?: number;
  pricePerSessionCents?: number;
  showPricePerSession?: boolean;
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
  typeSessionAllocations?: Array<{
    classTypeId: string;
    sessionCount: number;
    description?: string | null;
  }>;
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
  const normalizedDiscount =
    typeof plan.discountedPriceCents === "number" &&
    Number.isFinite(plan.discountedPriceCents) &&
    plan.discountedPriceCents >= 0 &&
    plan.discountedPriceCents < plan.priceCents
      ? Math.floor(plan.discountedPriceCents)
      : null;
  const finalPriceCents = normalizedDiscount ?? plan.priceCents;
  return {
    ...plan,
    categoryName:
      typeof plan.categoryName === "string" && plan.categoryName.trim().length > 0
        ? plan.categoryName.trim()
        : "General",
    sessionsPerMonth: coerceSessionsPerMonth(plan.sessionsPerMonth),
    showPricePerSession:
      typeof plan.showPricePerSession === "boolean" ? plan.showPricePerSession : true,
    discountedPriceCents: normalizedDiscount,
    finalPriceCents,
    guestCount: typeof plan.guestCount === "number" ? plan.guestCount : 0,
    features: Array.isArray(plan.features) ? plan.features : [],
    typeSessionAllocations: Array.isArray(plan.typeSessionAllocations)
      ? plan.typeSessionAllocations.filter(
          (allocation): allocation is NonNullable<PublicPackagePlan["typeSessionAllocations"]>[number] =>
            typeof allocation?.classTypeId === "string" &&
            allocation.classTypeId.length > 0 &&
            typeof allocation.sessionCount === "number" &&
            Number.isInteger(allocation.sessionCount) &&
            allocation.sessionCount > 0,
        )
      : [],
  };
}
