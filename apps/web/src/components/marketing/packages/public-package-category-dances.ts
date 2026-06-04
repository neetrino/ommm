import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

/** Normalized category key for the Dances package card (Admin → Packages category name). */
export const DANCES_PACKAGE_CATEGORY_KEY = "dances";

/** Public `/packages` card title (Figma). */
export const MARKETING_DANCES_CATEGORY_LABEL = "Dance";

/** Whether the category uses the redesigned Dances package card layout. */
export function isDancesPackageCategory(
  category: Pick<PublicPackageCategoryGroup, "id" | "label">,
): boolean {
  const idKey = normalizePackageCategoryKey(category.id);
  const labelKey = normalizePackageCategoryKey(category.label);
  return (
    idKey === DANCES_PACKAGE_CATEGORY_KEY ||
    labelKey === DANCES_PACKAGE_CATEGORY_KEY ||
    idKey === "dance" ||
    labelKey === "dance"
  );
}

export function isDancesPackageCategoryKey(categoryKey: string): boolean {
  const key = normalizePackageCategoryKey(decodeURIComponent(categoryKey));
  return key === DANCES_PACKAGE_CATEGORY_KEY || key === "dance";
}

/**
 * Category for the public `/packages` page — always Dance.
 * Uses Admin tiers when a Dances category exists; otherwise canonical marketing tiers.
 */
export function resolveMarketingDancesPackageCategory(
  categories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup {
  const dances = categories.find(isDancesPackageCategory);
  if (dances !== undefined) {
    return { ...dances, label: MARKETING_DANCES_CATEGORY_LABEL };
  }

  return {
    id: DANCES_PACKAGE_CATEGORY_KEY,
    label: MARKETING_DANCES_CATEGORY_LABEL,
    plans: [],
  };
}
