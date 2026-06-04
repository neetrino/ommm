import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

/** Normalized category key for Reformer Individual (Admin → Packages category name). */
export const REFORMER_INDIVIDUAL_PACKAGE_CATEGORY_KEY = "reformer individual";

/** Public `/packages` card title. */
export const MARKETING_REFORMER_INDIVIDUAL_CATEGORY_LABEL = "Reformer Individual";

/** Whether the category uses the Reformer Individual marketing table layout. */
export function isReformerIndividualPackageCategory(
  category: Pick<PublicPackageCategoryGroup, "id" | "label">,
): boolean {
  const idKey = normalizePackageCategoryKey(category.id);
  const labelKey = normalizePackageCategoryKey(category.label);
  return (
    idKey === REFORMER_INDIVIDUAL_PACKAGE_CATEGORY_KEY ||
    labelKey === REFORMER_INDIVIDUAL_PACKAGE_CATEGORY_KEY
  );
}

export function isReformerIndividualPackageCategoryKey(categoryKey: string): boolean {
  const key = normalizePackageCategoryKey(decodeURIComponent(categoryKey));
  return key === REFORMER_INDIVIDUAL_PACKAGE_CATEGORY_KEY;
}

/**
 * Category for the public `/packages` page — always Reformer Individual.
 * Uses Admin tiers when present; otherwise canonical marketing tiers (no API changes).
 */
export function resolveMarketingReformerIndividualPackageCategory(
  categories: readonly PublicPackageCategoryGroup[],
): PublicPackageCategoryGroup {
  const reformerIndividual = categories.find(isReformerIndividualPackageCategory);
  if (reformerIndividual !== undefined) {
    return { ...reformerIndividual, label: MARKETING_REFORMER_INDIVIDUAL_CATEGORY_LABEL };
  }

  return {
    id: REFORMER_INDIVIDUAL_PACKAGE_CATEGORY_KEY,
    label: MARKETING_REFORMER_INDIVIDUAL_CATEGORY_LABEL,
    plans: [],
  };
}
