import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

/** Normalized category key for Reformer Group (Admin → Packages category name). */
export const REFORMER_GROUP_PACKAGE_CATEGORY_KEY = "reformer group";

/** Public `/packages` card title. */
export const MARKETING_REFORMER_GROUP_CATEGORY_LABEL = "Reformer Group";

/** Whether the category uses the Reformer Group marketing table layout. */
export function isReformerGroupPackageCategory(
  category: Pick<PublicPackageCategoryGroup, "id" | "label">,
): boolean {
  const idKey = normalizePackageCategoryKey(category.id);
  const labelKey = normalizePackageCategoryKey(category.label);
  return (
    idKey === REFORMER_GROUP_PACKAGE_CATEGORY_KEY ||
    labelKey === REFORMER_GROUP_PACKAGE_CATEGORY_KEY
  );
}

export function isReformerGroupPackageCategoryKey(categoryKey: string): boolean {
  const key = normalizePackageCategoryKey(decodeURIComponent(categoryKey));
  return key === REFORMER_GROUP_PACKAGE_CATEGORY_KEY;
}

/**
 * Category for the public `/packages` page — always Reformer Group.
 * Uses Admin tiers when present; otherwise canonical marketing tiers (no API changes).
 */
export function resolveMarketingReformerGroupPackageCategory(
  categories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup {
  const reformer = categories.find(isReformerGroupPackageCategory);
  if (reformer !== undefined) {
    return { ...reformer, label: MARKETING_REFORMER_GROUP_CATEGORY_LABEL };
  }

  return {
    id: REFORMER_GROUP_PACKAGE_CATEGORY_KEY,
    label: MARKETING_REFORMER_GROUP_CATEGORY_LABEL,
    plans: [],
  };
}
