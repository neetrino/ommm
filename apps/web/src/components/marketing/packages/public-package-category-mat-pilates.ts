import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

/** Normalized category key for Mat Pilates (Admin → Packages category name). */
export const MAT_PILATES_PACKAGE_CATEGORY_KEY = "mat pilates";

/** Public `/packages` card title. */
export const MARKETING_MAT_PILATES_CATEGORY_LABEL = "Mat Pilates";

/** Whether the category uses the Mat Pilates marketing table layout. */
export function isMatPilatesPackageCategory(
  category: Pick<PublicPackageCategoryGroup, "id" | "label">,
): boolean {
  const idKey = normalizePackageCategoryKey(category.id);
  const labelKey = normalizePackageCategoryKey(category.label);
  return (
    idKey === MAT_PILATES_PACKAGE_CATEGORY_KEY || labelKey === MAT_PILATES_PACKAGE_CATEGORY_KEY
  );
}

export function isMatPilatesPackageCategoryKey(categoryKey: string): boolean {
  const key = normalizePackageCategoryKey(decodeURIComponent(categoryKey));
  return key === MAT_PILATES_PACKAGE_CATEGORY_KEY;
}

/**
 * Category for the public `/packages` page — always Mat Pilates.
 * Uses Admin tiers when present; otherwise canonical marketing tiers (no API changes).
 */
export function resolveMarketingMatPilatesPackageCategory(
  categories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup {
  const matPilates = categories.find(isMatPilatesPackageCategory);
  if (matPilates !== undefined) {
    return { ...matPilates, label: MARKETING_MAT_PILATES_CATEGORY_LABEL };
  }

  return {
    id: MAT_PILATES_PACKAGE_CATEGORY_KEY,
    label: MARKETING_MAT_PILATES_CATEGORY_LABEL,
    plans: [],
  };
}
