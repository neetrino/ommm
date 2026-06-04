import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";

/** Normalized category key for the Dances package card (Admin → Packages category name). */
export const DANCES_PACKAGE_CATEGORY_KEY = "dances";

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
