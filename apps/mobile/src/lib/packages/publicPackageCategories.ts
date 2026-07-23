import type { PublicPackagePlan } from "./publicPackagePlan";

export type PublicPackageCategoryGroup = {
  id: string;
  label: string;
  plans: PublicPackagePlan[];
};

function normalizePackageCategoryKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function normalizePackageCategoryLabel(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function isConfiguredPublicPackagePlan(plan: PublicPackagePlan): boolean {
  return plan.priceCents > 0;
}

/** Groups active public plans by category (same logic as web marketing packages page). */
export function groupVisiblePublicPackageCategories(
  plans: readonly PublicPackagePlan[],
): PublicPackageCategoryGroup[] {
  const bySlug = new Map<string, PublicPackageCategoryGroup>();
  for (const plan of plans) {
    const label = normalizePackageCategoryLabel(plan.categoryName);
    const slug =
      typeof plan.categorySlug === "string" && plan.categorySlug.trim().length > 0
        ? plan.categorySlug.trim()
        : normalizePackageCategoryKey(label);
    const existing = bySlug.get(slug);
    if (existing !== undefined) {
      existing.plans.push(plan);
      continue;
    }
    bySlug.set(slug, { id: slug, label, plans: [plan] });
  }

  return [...bySlug.values()]
    .map((category) => ({
      ...category,
      plans: category.plans
        .filter(isConfiguredPublicPackagePlan)
        .sort((left, right) => {
          if (left.displayOrder !== right.displayOrder) {
            return left.displayOrder - right.displayOrder;
          }
          return resolvePlanFinalPriceCents(left) - resolvePlanFinalPriceCents(right);
        }),
    }))
    .filter((category) => category.plans.length > 0)
    .sort((left, right) => left.label.localeCompare(right.label));
}

function resolvePlanFinalPriceCents(plan: PublicPackagePlan): number {
  if (
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents
  ) {
    return plan.discountedPriceCents;
  }
  return plan.priceCents;
}

export function categoryHasMultiplePricedTiers(
  plans: readonly PublicPackagePlan[],
): boolean {
  const pricedCount = plans.filter((plan) => plan.priceCents > 0).length;
  return pricedCount > 1 || (plans.length > 1 && pricedCount > 0);
}
