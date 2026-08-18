/** Public package plan returned by `GET /packages/plans` (active plans only). */
export type PublicPackagePlan = {
  id: string;
  name: string;
  categoryName: string;
  categorySlug?: string;
  description: string | null;
  priceCents: number;
  discountedPriceCents?: number | null;
  finalPriceCents?: number;
  pricePerSessionCents?: number;
  showPricePerSession?: boolean;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  startDate?: string | null;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
  guestCount?: number;
  freezeAllowedCount?: number;
  freezeMaxDaysPerUse?: number;
  availableQuantity?: number | null;
  displayOrder: number;
  typeSessionAllocations?: Array<{
    classTypeId: string;
    classTypeName?: string;
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

function coerceAvailableQuantity(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
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
    categorySlug:
      typeof plan.categorySlug === "string" && plan.categorySlug.trim().length > 0
        ? plan.categorySlug.trim()
        : typeof plan.categoryName === "string" && plan.categoryName.trim().length > 0
          ? plan.categoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : "general",
    sessionsPerMonth: coerceSessionsPerMonth(plan.sessionsPerMonth),
    showPricePerSession:
      typeof plan.showPricePerSession === "boolean" ? plan.showPricePerSession : true,
    discountedPriceCents: normalizedDiscount,
    finalPriceCents,
    guestCount: typeof plan.guestCount === "number" ? plan.guestCount : 0,
    freezeAllowedCount:
      typeof plan.freezeAllowedCount === "number" ? plan.freezeAllowedCount : 0,
    freezeMaxDaysPerUse:
      typeof plan.freezeMaxDaysPerUse === "number" ? plan.freezeMaxDaysPerUse : 0,
    availableQuantity: coerceAvailableQuantity(plan.availableQuantity),
    startDate:
      typeof plan.startDate === "string" && plan.startDate.trim().length > 0
        ? plan.startDate.trim()
        : null,
    features: Array.isArray(plan.features) ? plan.features : [],
    typeSessionAllocations: Array.isArray(plan.typeSessionAllocations)
      ? plan.typeSessionAllocations
          .filter(
            (allocation): allocation is NonNullable<PublicPackagePlan["typeSessionAllocations"]>[number] =>
              typeof allocation?.classTypeId === "string" &&
              allocation.classTypeId.length > 0 &&
              typeof allocation.sessionCount === "number" &&
              Number.isInteger(allocation.sessionCount) &&
              allocation.sessionCount > 0,
          )
          .map((allocation) => ({
            classTypeId: allocation.classTypeId,
            sessionCount: allocation.sessionCount,
            ...(typeof allocation.classTypeName === "string" &&
            allocation.classTypeName.trim().length > 0
              ? { classTypeName: allocation.classTypeName.trim() }
              : {}),
            ...(typeof allocation.description === "string" && allocation.description.trim().length > 0
              ? { description: allocation.description.trim() }
              : {}),
          }))
      : [],
  };
}
