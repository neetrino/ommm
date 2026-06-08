import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
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
import {
  PACKAGES_PAGE_CATEGORY_COLOR_VARIANT_KEYS,
  type PackagesPageCategoryColorVariantKey,
} from "@/components/marketing/packages/packages-page-tokens";

export type PackagesPageCategoryCardCopy = {
  id: string;
  label: string;
  priceAmount: string | null;
  priceFromPrefix?: string;
  hasPlans: boolean;
};

export type PackagesPageAccordionCategory = PackagesPageCategoryCardCopy & {
  plans: PublicPackagePlan[];
  visualStyleKey: PackagesPageCategoryColorVariantKey;
};

type PackagesPageCardLabels = {
  priceFromPrefix: string;
};

const DEFAULT_PACKAGE_COLOR_VARIANT = PACKAGES_PAGE_CATEGORY_COLOR_VARIANT_KEYS[0];

const KNOWN_MARKETING_CATEGORY_RESOLVERS = [
  resolveMarketingReformerGroupPackageCategory,
  resolveMarketingReformerIndividualPackageCategory,
  resolveMarketingMatPilatesPackageCategory,
  resolveMarketingYogaPackageCategory,
  resolveMarketingDancesPackageCategory,
] as const;

function hashCategoryKey(categoryKey: string): number {
  let hash = 0;
  for (const char of categoryKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function resolveCategoryColorVariant(
  category: Pick<PublicPackageCategoryGroup, "id" | "label">,
  previousVariant: PackagesPageCategoryColorVariantKey | null,
): PackagesPageCategoryColorVariantKey {
  const categoryId = normalizePackageCategoryKey(category.id);
  const categoryLabel = normalizePackageCategoryKey(category.label);
  const canonicalKey = categoryId === "dance" || categoryLabel === "dance" ? "dances" : categoryId;
  const directMatch = PACKAGES_PAGE_CATEGORY_COLOR_VARIANT_KEYS.find(
    (variant) => variant === canonicalKey || variant === categoryLabel,
  );
  const variants = PACKAGES_PAGE_CATEGORY_COLOR_VARIANT_KEYS;
  const variantCount: number = variants.length;
  const startIndex =
    directMatch !== undefined
      ? variants.indexOf(directMatch)
      : hashCategoryKey(categoryId) % variantCount;
  const candidate = variants[startIndex] ?? DEFAULT_PACKAGE_COLOR_VARIANT;

  if (candidate !== previousVariant || variantCount === 1) {
    return candidate;
  }
  return variants[(startIndex + 1) % variants.length] ?? candidate;
}

function withColorVariants(
  categories: readonly PackagesPageAccordionCategory[],
): PackagesPageAccordionCategory[] {
  let previousVariant: PackagesPageCategoryColorVariantKey | null = null;
  return categories.map((category) => {
    const visualStyleKey = resolveCategoryColorVariant(category, previousVariant);
    previousVariant = visualStyleKey;
    return { ...category, visualStyleKey };
  });
}

/** Marketing order — known Figma cards first, then Admin-created categories. */
export function listMarketingPackageCategories(
  apiCategories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup[] {
  const usedKeys = new Set<string>();
  const ordered: PublicPackageCategoryGroup[] = [];

  for (const resolveKnownCategory of KNOWN_MARKETING_CATEGORY_RESOLVERS) {
    const category = resolveKnownCategory(apiCategories);
    if (category.plans.length === 0) {
      continue;
    }
    usedKeys.add(normalizePackageCategoryKey(category.id));
    ordered.push(category);
  }

  for (const category of apiCategories) {
    const key = normalizePackageCategoryKey(category.id);
    if (!usedKeys.has(key)) {
      ordered.push(category);
    }
  }

  return ordered;
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
  const accordionCategories = listMarketingPackageCategories(categories).map((category) => {
    const configuredPlans = category.plans.filter((plan) => plan.priceCents > 0);
    const hasPlans = configuredPlans.length > 0;
    const plans = configuredPlans;

    if (!hasPlans) {
      return {
        id: category.id,
        label: category.label,
        priceAmount: null,
        hasPlans: false,
        plans,
        visualStyleKey: DEFAULT_PACKAGE_COLOR_VARIANT,
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
      visualStyleKey: DEFAULT_PACKAGE_COLOR_VARIANT,
    };
  });

  return withColorVariants(accordionCategories);
}
