import type { HomePlanCardCopy } from "@/components/marketing/home/home-plan-card-types";
import {
  categoryHasMultiplePricedTiers,
  groupVisiblePublicPackageCategories,
  resolveCategoryStartingPriceCents,
} from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";
import { formatAmdFromCents } from "@/lib/price-amd";

export type { HomePlanCardCopy } from "@/components/marketing/home/home-plan-card-types";

type HomePlanCardLabels = {
  sessionsUnlimited: string;
  sessionsCount: (count: number) => string;
  guestCount: (count: number) => string;
  ctaAria: (planName: string) => string;
  categoryPackages: (count: number) => string;
  priceFromPrefix: string;
};

function resolveCategoryDetails(
  plans: readonly PublicPackagePlan[],
  labels: Pick<HomePlanCardLabels, "categoryPackages" | "sessionsUnlimited" | "sessionsCount">,
): string {
  const descriptions = plans
    .map((plan) => plan.description?.trim())
    .filter((value): value is string => value !== undefined && value.length > 0);
  if (descriptions.length > 0) {
    return descriptions[0];
  }

  const pricedPlans = plans.filter((plan) => plan.priceCents > 0);
  const featuredPlan = pricedPlans.sort((left, right) => left.priceCents - right.priceCents)[0];
  if (featuredPlan !== undefined) {
    if (featuredPlan.isUnlimited) {
      return labels.sessionsUnlimited;
    }
    if (featuredPlan.sessionsPerMonth !== null && featuredPlan.sessionsPerMonth > 0) {
      return labels.sessionsCount(featuredPlan.sessionsPerMonth);
    }
  }

  return labels.categoryPackages(plans.length);
}

function formatCategoryPrice(
  plans: readonly PublicPackagePlan[],
  locale: string,
  labels: Pick<HomePlanCardLabels, "priceFromPrefix">,
): Pick<HomePlanCardCopy, "priceAmount" | "priceFromPrefix"> {
  const startingPriceCents = resolveCategoryStartingPriceCents(plans);
  const amount = formatAmdFromCents(startingPriceCents, locale);
  if (categoryHasMultiplePricedTiers(plans)) {
    return {
      priceFromPrefix: labels.priceFromPrefix,
      priceAmount: amount,
    };
  }
  return { priceAmount: amount };
}

/** One Home card per package category (matches Admin Packages accordion groups). */
export function buildHomeCategoryCardsFromPlans(
  plans: readonly PublicPackagePlan[],
  locale: string,
  labels: HomePlanCardLabels,
): HomePlanCardCopy[] {
  return groupVisiblePublicPackageCategories(plans).map((category) => ({
    id: category.id,
    planName: category.label,
    details: resolveCategoryDetails(category.plans, labels),
    ...formatCategoryPrice(category.plans, locale, labels),
    ctaAria: labels.ctaAria(category.label),
    isPopular: category.plans.some((plan) => plan.isPopular),
  }));
}
