import { assignPackageCardGradientStartColors } from "./packageCardColors";
import {
  categoryHasMultiplePricedTiers,
  groupVisiblePublicPackageCategories,
  type PublicPackageCategoryGroup,
} from "./publicPackageCategories";
import type { PublicPackagePlan } from "./publicPackagePlan";
import { formatPackagePriceLabel } from "./formatPackageDisplay";

export type PackagesPageAccordionCategory = {
  id: string;
  label: string;
  priceAmount: string | null;
  originalPriceAmount: string | null;
  priceFromPrefix: string | undefined;
  hasPlans: boolean;
  plans: PublicPackagePlan[];
  gradientStartColor: string;
};

const FALLBACK_GRADIENT_START_COLOR = "#ede9dd";

function normalizePackageCategoryKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function resolveCategoryDisplayOrder(category: PublicPackageCategoryGroup): number {
  if (category.plans.length === 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.min(...category.plans.map((plan) => plan.displayOrder));
}

function sortPublicPackageCategoriesForDisplay(
  categories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup[] {
  return [...categories].sort((left, right) => {
    const leftOrder = resolveCategoryDisplayOrder(left);
    const rightOrder = resolveCategoryDisplayOrder(right);
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.label.localeCompare(right.label);
  });
}

function resolveCategoryCardPriceCents(plans: readonly PublicPackagePlan[]): {
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
    const planFinalCents =
      typeof plan.discountedPriceCents === "number" &&
      plan.discountedPriceCents > 0 &&
      plan.discountedPriceCents < plan.priceCents
        ? plan.discountedPriceCents
        : plan.priceCents;
    if (planFinalCents < finalCents) {
      finalCents = planFinalCents;
      originalCents =
        typeof plan.discountedPriceCents === "number" &&
        plan.discountedPriceCents > 0 &&
        plan.discountedPriceCents < plan.priceCents
          ? plan.priceCents
          : null;
    }
  }

  return { finalCents, originalCents };
}

/** Builds accordion categories with gradients — mirrors web packages page data. */
export function buildPackagesPageAccordionCategories(
  apiCategories: readonly PublicPackageCategoryGroup[],
  priceFromPrefix: string,
): PackagesPageAccordionCategory[] {
  const publicCategories = sortPublicPackageCategoriesForDisplay(apiCategories);
  const gradientStartColors = assignPackageCardGradientStartColors(
    publicCategories.map((category) => category.id),
  );

  return publicCategories.map((category, index) => {
    const configuredPlans = category.plans.filter((plan) => plan.priceCents > 0);
    const hasPlans = configuredPlans.length > 0;
    const gradientStartColor =
      gradientStartColors[index] ?? gradientStartColors[0] ?? FALLBACK_GRADIENT_START_COLOR;

    if (!hasPlans) {
      return {
        id: category.id,
        label: category.label,
        priceAmount: null,
        originalPriceAmount: null,
        priceFromPrefix: undefined,
        hasPlans: false,
        plans: configuredPlans,
        gradientStartColor,
      };
    }

    const { finalCents, originalCents } = resolveCategoryCardPriceCents(category.plans);
    const priceAmount = formatPackagePriceLabel({ priceCents: finalCents });
    const originalPriceAmount =
      originalCents !== null
        ? formatPackagePriceLabel({ priceCents: originalCents })
        : null;
    const showFromPrefix = categoryHasMultiplePricedTiers(category.plans);

    return {
      id: category.id,
      label: category.label,
      priceAmount,
      originalPriceAmount,
      priceFromPrefix: showFromPrefix ? priceFromPrefix : undefined,
      hasPlans: true,
      plans: configuredPlans,
      gradientStartColor,
    };
  });
}

export function buildAccordionCategoriesFromPlans(
  plans: readonly PublicPackagePlan[],
  priceFromPrefix: string,
): PackagesPageAccordionCategory[] {
  return buildPackagesPageAccordionCategories(
    groupVisiblePublicPackageCategories(plans),
    priceFromPrefix,
  );
}

export function normalizePackageCategoryKeyForMatch(name: string): string {
  return normalizePackageCategoryKey(name);
}
