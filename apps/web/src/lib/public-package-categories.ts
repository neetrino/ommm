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
      plans: [...category.plans].sort((left, right) => {
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

/**
 * All Admin package categories for the public `/packages` page.
 * Priced tiers match the Admin table; inactive plans are excluded by the API.
 */
export function groupAllPublicPackageCategories(
  plans: readonly PublicPackagePlan[],
): PublicPackageCategoryGroup[] {
  return groupPublicPlansByCategory(plans).map((category) => ({
    ...category,
    plans: listConfiguredPublicPackagePlans(category.plans),
  }));
}

function planHasPublicDiscount(plan: PublicPackagePlan): boolean {
  return (
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents
  );
}

function resolvePlanFinalPriceCents(plan: PublicPackagePlan): number {
  return planHasPublicDiscount(plan)
    ? (plan.discountedPriceCents as number)
    : plan.priceCents;
}

/** Lowest tier final price for category cards; original when that tier is discounted. */
export function resolveCategoryCardPriceCents(plans: readonly PublicPackagePlan[]): {
  finalCents: number;
  originalCents: number | null;
} {
  const pricedPlans = plans.filter((plan) => plan.priceCents > 0);
  if (pricedPlans.length === 0) {
    return {
      finalCents: Math.min(...plans.map((plan) => plan.priceCents)),
      originalCents: null,
    };
  }

  let finalCents = Infinity;
  let originalCents: number | null = null;

  for (const plan of pricedPlans) {
    const planFinalCents = resolvePlanFinalPriceCents(plan);
    if (planFinalCents < finalCents) {
      finalCents = planFinalCents;
      originalCents = planHasPublicDiscount(plan) ? plan.priceCents : null;
    }
  }

  return { finalCents, originalCents };
}

export function resolveCategoryStartingPriceCents(
  plans: readonly PublicPackagePlan[],
): number {
  return resolveCategoryCardPriceCents(plans).finalCents;
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
