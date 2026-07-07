import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { MARKETING_DANCES_CATEGORY_LABEL } from "@/components/marketing/packages/public-package-category-dances";
import { MARKETING_MAT_PILATES_CATEGORY_LABEL } from "@/components/marketing/packages/public-package-category-mat-pilates";
import { MARKETING_REFORMER_GROUP_CATEGORY_LABEL } from "@/components/marketing/packages/public-package-category-reformer-group";
import { MARKETING_REFORMER_INDIVIDUAL_CATEGORY_LABEL } from "@/components/marketing/packages/public-package-category-reformer-individual";
import { MARKETING_YOGA_CATEGORY_LABEL } from "@/components/marketing/packages/public-package-category-yoga";
import {
  categoryHasMultiplePricedTiers,
  resolveCategoryCardPriceCents,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import { assignPackageCardGradientStartColors } from "@/lib/package-card-colors";
import type { PublicPackagePlan } from "@/lib/public-package-plan";
import { formatAmdFromCents } from "@/lib/price-amd";

export type PackagesPageCategoryCardCopy = {
  id: string;
  label: string;
  priceAmount: string | null;
  originalPriceAmount?: string | null;
  priceFromPrefix?: string;
  hasPlans: boolean;
};

export type PackagesPageAccordionCategory = PackagesPageCategoryCardCopy & {
  plans: PublicPackagePlan[];
  gradientStartColor: string;
};

type PackagesPageCardLabels = {
  priceFromPrefix: string;
};

const FALLBACK_GRADIENT_START_COLOR = "#ede9dd";

/** Figma-facing labels for known Admin category keys (display only — no filtering). */
const PUBLIC_PACKAGE_CATEGORY_LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  "reformer group": MARKETING_REFORMER_GROUP_CATEGORY_LABEL,
  "reformer individual": MARKETING_REFORMER_INDIVIDUAL_CATEGORY_LABEL,
  "mat pilates": MARKETING_MAT_PILATES_CATEGORY_LABEL,
  yoga: MARKETING_YOGA_CATEGORY_LABEL,
  dances: MARKETING_DANCES_CATEGORY_LABEL,
  dance: MARKETING_DANCES_CATEGORY_LABEL,
};

function resolvePublicPackageCategoryLabel(category: PublicPackageCategoryGroup): string {
  const idKey = normalizePackageCategoryKey(category.id);
  const labelKey = normalizePackageCategoryKey(category.label);
  return (
    PUBLIC_PACKAGE_CATEGORY_LABEL_OVERRIDES[idKey] ??
    PUBLIC_PACKAGE_CATEGORY_LABEL_OVERRIDES[labelKey] ??
    category.label
  );
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

/** All visible Admin package categories — no static subset or mock categories. */
export function listPublicPackageCategoriesForPage(
  apiCategories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup[] {
  return sortPublicPackageCategoriesForDisplay(apiCategories).map((category) => ({
    ...category,
    label: resolvePublicPackageCategoryLabel(category),
  }));
}

export function resolveMarketingPackageCategoryByKey(
  apiCategories: readonly PublicPackageCategoryGroup[],
  categoryKey: string,
): PublicPackageCategoryGroup | null {
  const decodedKey = decodeURIComponent(categoryKey).trim();
  const normalizedKey = normalizePackageCategoryKey(decodedKey);
  return (
    listPublicPackageCategoriesForPage(apiCategories).find(
      (category) =>
        category.id === decodedKey ||
        normalizePackageCategoryKey(category.id) === normalizedKey ||
        normalizePackageCategoryKey(category.label) === normalizedKey,
    ) ?? null
  );
}

export function buildPackagesPageCategoryCards(
  categories: readonly PublicPackageCategoryGroup[],
  locale: string,
  labels: PackagesPageCardLabels,
): PackagesPageCategoryCardCopy[] {
  return buildPackagesPageAccordionCategories(categories, locale, labels);
}

export function buildPackagesPageAccordionCategories(
  categories: readonly PublicPackageCategoryGroup[],
  locale: string,
  labels: PackagesPageCardLabels,
): PackagesPageAccordionCategory[] {
  const publicCategories = listPublicPackageCategoriesForPage(categories);
  const gradientStartColors = assignPackageCardGradientStartColors(
    publicCategories.map((category) => category.id),
  );

  return publicCategories.map((category, index) => {
    const configuredPlans = category.plans.filter((plan) => plan.priceCents > 0);
    const hasPlans = configuredPlans.length > 0;
    const plans = configuredPlans;
    const gradientStartColor =
      gradientStartColors[index] ?? gradientStartColors[0] ?? FALLBACK_GRADIENT_START_COLOR;

    if (!hasPlans) {
      return {
        id: category.id,
        label: category.label,
        priceAmount: null,
        hasPlans: false,
        plans,
        gradientStartColor,
      };
    }

    const { finalCents, originalCents } = resolveCategoryCardPriceCents(category.plans);
    const priceAmount = formatAmdFromCents(finalCents, locale);
    const originalPriceAmount =
      originalCents !== null ? formatAmdFromCents(originalCents, locale) : null;
    const priceFromPrefix = categoryHasMultiplePricedTiers(category.plans)
      ? labels.priceFromPrefix
      : undefined;

    return {
      id: category.id,
      label: category.label,
      priceAmount,
      originalPriceAmount,
      priceFromPrefix,
      hasPlans: true,
      plans,
      gradientStartColor,
    };
  });
}
