import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { listPublicPackageCategoryDisplayPlans } from "@/components/marketing/packages/public-package-category-display-plans";
import { resolveMarketingDancesPackageCategory } from "@/components/marketing/packages/public-package-category-dances";
import { resolveMarketingMatPilatesPackageCategory } from "@/components/marketing/packages/public-package-category-mat-pilates";
import { resolveMarketingReformerIndividualPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-individual";
import { resolveMarketingReformerGroupPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-group";
import { resolveMarketingYogaPackageCategory } from "@/components/marketing/packages/public-package-category-yoga";
import {
  categoryHasMultiplePricedTiers,
  resolveCategoryStartingPriceCents,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";
import { formatAmdFromCents } from "@/lib/price-amd";

export type PackagesPageCategoryCardCopy = {
  id: string;
  label: string;
  priceAmount: string | null;
  priceFromPrefix?: string;
  hasPlans: boolean;
};

export type PackagesPageAccordionCategory = PackagesPageCategoryCardCopy & {
  plans: PublicPackagePlan[];
};

type PackagesPageCardLabels = {
  priceFromPrefix: string;
};

/** Fixed marketing order — Figma `395:1652` left to right. */
export function listMarketingPackageCategories(
  apiCategories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup[] {
  return [
    resolveMarketingReformerGroupPackageCategory(apiCategories),
    resolveMarketingReformerIndividualPackageCategory(apiCategories),
    resolveMarketingMatPilatesPackageCategory(apiCategories),
    resolveMarketingYogaPackageCategory(apiCategories),
    resolveMarketingDancesPackageCategory(apiCategories),
  ];
}

export function resolveMarketingPackageCategoryByKey(
  apiCategories: readonly PublicPackageCategoryGroup[],
  categoryKey: string,
): PublicPackageCategoryGroup | null {
  const normalizedKey = normalizePackageCategoryKey(decodeURIComponent(categoryKey));
  return (
    listMarketingPackageCategories(apiCategories).find(
      (category) => normalizePackageCategoryKey(category.id) === normalizedKey,
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
  return listMarketingPackageCategories(categories).map((category) => {
    const configuredPlans = category.plans.filter((plan) => plan.priceCents > 0);
    const hasPlans = configuredPlans.length > 0;
    const plans = listPublicPackageCategoryDisplayPlans(category);

    if (!hasPlans) {
      return {
        id: category.id,
        label: category.label,
        priceAmount: null,
        hasPlans: false,
        plans,
      };
    }

    const startingPriceCents = resolveCategoryStartingPriceCents(category.plans);
    const priceAmount = formatAmdFromCents(startingPriceCents, locale);
    const priceFromPrefix = categoryHasMultiplePricedTiers(category.plans)
      ? labels.priceFromPrefix
      : undefined;

    return {
      id: category.id,
      label: category.label,
      priceAmount,
      priceFromPrefix,
      hasPlans: true,
      plans,
    };
  });
}
