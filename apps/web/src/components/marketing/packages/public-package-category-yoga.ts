import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

/** Normalized category key for Yoga (Admin → Packages category name). */
export const YOGA_PACKAGE_CATEGORY_KEY = "yoga";

/** Public `/packages` card title. */
export const MARKETING_YOGA_CATEGORY_LABEL = "Yoga";

/** Whether the category uses the Yoga marketing table layout. */
export function isYogaPackageCategory(
  category: Pick<PublicPackageCategoryGroup, "id" | "label">,
): boolean {
  const idKey = normalizePackageCategoryKey(category.id);
  const labelKey = normalizePackageCategoryKey(category.label);
  return idKey === YOGA_PACKAGE_CATEGORY_KEY || labelKey === YOGA_PACKAGE_CATEGORY_KEY;
}

export function isYogaPackageCategoryKey(categoryKey: string): boolean {
  const key = normalizePackageCategoryKey(decodeURIComponent(categoryKey));
  return key === YOGA_PACKAGE_CATEGORY_KEY;
}

/**
 * Category for the public `/packages` page — always Yoga.
 * Uses Admin tiers when present; otherwise canonical marketing tiers (no API changes).
 */
export function resolveMarketingYogaPackageCategory(
  categories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup {
  const yoga = categories.find(isYogaPackageCategory);
  if (yoga !== undefined) {
    return { ...yoga, label: MARKETING_YOGA_CATEGORY_LABEL };
  }

  return {
    id: YOGA_PACKAGE_CATEGORY_KEY,
    label: MARKETING_YOGA_CATEGORY_LABEL,
    plans: [],
  };
}
