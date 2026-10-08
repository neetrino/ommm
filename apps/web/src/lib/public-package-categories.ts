import {
  normalizePackageCategoryKey,
  normalizePackageCategoryLabel,
} from "@/components/admin/package-category-utils";
import { resolvePublicPackageTotalSessions } from "@/components/marketing/packages/public-package-tier-display";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

export type PublicPackageCategoryGroup = {
  id: string;
  label: string;
  plans: PublicPackagePlan[];
};

/** Ascending total sessions. Plans without a session total sort last. */
export function comparePublicPackagePlansByTotalSessions(
  left: PublicPackagePlan,
  right: PublicPackagePlan,
): number {
  const bySessions = compareOptionalSessionCount(
    resolvePublicPackageTotalSessions(left),
    resolvePublicPackageTotalSessions(right),
  );
  if (bySessions !== 0) {
    return bySessions;
  }
  const byName = left.name.localeCompare(right.name);
  if (byName !== 0) {
    return byName;
  }
  return left.id.localeCompare(right.id);
}

function compareOptionalSessionCount(left: number | null, right: number | null): number {
  if (left === null && right === null) {
    return 0;
  }
  if (left === null) {
    return 1;
  }
  if (right === null) {
    return -1;
  }
  return left - right;
}

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
      plans: [...category.plans].sort(comparePublicPackagePlansByTotalSessions),
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

/** Earliest configured start date among priced tiers for category cards. */
export function resolveCategoryCardStartDate(
  plans: readonly PublicPackagePlan[],
): string | null {
  const startDates = listConfiguredPublicPackagePlans(plans)
    .map((plan) => plan.startDate?.trim() ?? "")
    .filter((value) => value.length > 0);
  if (startDates.length === 0) {
    return null;
  }
  return [...startDates].sort()[0] ?? null;
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
