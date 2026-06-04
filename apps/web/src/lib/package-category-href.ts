import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { isDancesPackageCategoryKey } from "@/components/marketing/packages/public-package-category-dances";
import { isMatPilatesPackageCategoryKey } from "@/components/marketing/packages/public-package-category-mat-pilates";
import { isYogaPackageCategoryKey } from "@/components/marketing/packages/public-package-category-yoga";
import { isReformerIndividualPackageCategoryKey } from "@/components/marketing/packages/public-package-category-reformer-individual";
import { isReformerGroupPackageCategoryKey } from "@/components/marketing/packages/public-package-category-reformer-group";

function isMarketingPackagesPageCategoryKey(categoryKey: string): boolean {
  return (
    isDancesPackageCategoryKey(categoryKey) ||
    isReformerGroupPackageCategoryKey(categoryKey) ||
    isReformerIndividualPackageCategoryKey(categoryKey) ||
    isMatPilatesPackageCategoryKey(categoryKey) ||
    isYogaPackageCategoryKey(categoryKey)
  );
}

/** Builds a locale-aware path to the public package category detail page. */
export function buildPackageCategoryHref(
  categoryKey: string,
  audience: PublicPackageCategoryCardsAudience,
  planId?: string,
): string {
  const base =
    audience === "member"
      ? `/user/packages/${encodeURIComponent(categoryKey)}`
      : isMarketingPackagesPageCategoryKey(categoryKey)
        ? "/packages"
        : `/packages/${encodeURIComponent(categoryKey)}`;
  if (planId === undefined || planId.length === 0) {
    return base;
  }
  return `${base}?plan=${encodeURIComponent(planId)}`;
}
