import {
  listConfiguredPublicPackagePlans,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

const MARKETING_FALLBACK_PLAN_ID_PREFIXES = [
  "marketing-dances-tier-",
  "marketing-mat-pilates-tier-",
  "marketing-yoga-tier-",
  "marketing-reformer-group-tier-",
  "marketing-reformer-individual-tier-",
] as const;

/** Synthetic marketing tiers — display-only, not subscribable. */
export function isMarketingPackageFallbackPlan(plan: Pick<PublicPackagePlan, "id">): boolean {
  return MARKETING_FALLBACK_PLAN_ID_PREFIXES.some((prefix) => plan.id.startsWith(prefix));
}

/**
 * All real configured tiers in a category — matches Packages accordion rows.
 * Excludes synthetic marketing fallback plans only.
 */
export function listPublicPackageCategorySubscribablePlans(
  category: PublicPackageCategoryGroup,
): PublicPackagePlan[] {
  return listConfiguredPublicPackagePlans(category.plans)
    .filter((plan) => plan.isActive)
    .filter((plan) => !isMarketingPackageFallbackPlan(plan))
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }
      const leftPrice =
        typeof left.discountedPriceCents === "number" &&
        left.discountedPriceCents > 0 &&
        left.discountedPriceCents < left.priceCents
          ? left.discountedPriceCents
          : left.priceCents;
      const rightPrice =
        typeof right.discountedPriceCents === "number" &&
        right.discountedPriceCents > 0 &&
        right.discountedPriceCents < right.priceCents
          ? right.discountedPriceCents
          : right.priceCents;
      return leftPrice - rightPrice;
    });
}
