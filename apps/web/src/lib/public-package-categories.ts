import {
  normalizePackageCategoryKey,
  normalizePackageCategoryLabel,
} from "@/components/admin/package-category-utils";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

export type PublicPackageCategoryGroup = {
  id: string;
  label: string;
  plans: PublicPackagePlan[];
};

/** Matches Admin table rows — only priced tiers are shown publicly. */
export function isConfiguredPublicPackagePlan(plan: PublicPackagePlan): boolean {
  return plan.priceCents > 0;
}

export function listConfiguredPublicPackagePlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return plans.filter(isConfiguredPublicPackagePlan);
}

/** Groups active public plans by category (same logic as Admin Packages accordions). */
export function groupPublicPlansByCategory(
  plans: readonly PublicPackagePlan[],
): PublicPackageCategoryGroup[] {
  const byKey = new Map<string, PublicPackageCategoryGroup>();
  for (const plan of plans) {
    const label = normalizePackageCategoryLabel(plan.categoryName);
    const key = normalizePackageCategoryKey(label);
    const existing = byKey.get(key);
    if (existing !== undefined) {
      existing.plans.push(plan);
      continue;
    }
    byKey.set(key, { id: key, label, plans: [plan] });
  }

  return [...byKey.values()]
    .map((category) => ({
      ...category,
      plans: [...category.plans].sort((left, right) => {
        if (left.displayOrder !== right.displayOrder) {
          return left.displayOrder - right.displayOrder;
        }
        return left.priceCents - right.priceCents;
      }),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

/** Categories with at least one configured tier — mirrors Admin Packages accordion content. */
export function groupVisiblePublicPackageCategories(
  plans: readonly PublicPackagePlan[],
): PublicPackageCategoryGroup[] {
  return groupPublicPlansByCategory(plans)
    .map((category) => ({
      ...category,
      plans: listConfiguredPublicPackagePlans(category.plans),
    }))
    .filter((category) => category.plans.length > 0);
}

export function resolveCategoryStartingPriceCents(
  plans: readonly PublicPackagePlan[],
): number {
  const priced = plans
    .map((plan) => plan.priceCents)
    .filter((priceCents) => priceCents > 0);
  if (priced.length > 0) {
    return Math.min(...priced);
  }
  return Math.min(...plans.map((plan) => plan.priceCents));
}

export function categoryHasMultiplePricedTiers(
  plans: readonly PublicPackagePlan[],
): boolean {
  const pricedCount = plans.filter((plan) => plan.priceCents > 0).length;
  return pricedCount > 1 || (plans.length > 1 && pricedCount > 0);
}

/** Priced tiers only — same rows as the Admin packages table. */
export function listCategoryDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listConfiguredPublicPackagePlans(plans);
}
