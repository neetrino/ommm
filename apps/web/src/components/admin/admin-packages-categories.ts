import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";
import { categoryNamesToOptions, normalizePackageCategoryKey } from "@/components/admin/package-category-utils";

/** Distinct package categories that have at least one plan (accordion + filter). */
export function buildPackageCategoryOptions(
  packages: readonly AdminPackageRow[],
): AdminPackagesCategoryOption[] {
  const names: string[] = [];
  for (const pkg of packages) {
    names.push(pkg.categoryName);
  }
  return categoryNamesToOptions(names);
}

export function packagesInCategory(
  packages: readonly AdminPackageRow[],
  categoryId: string,
): AdminPackageRow[] {
  const categoryKey = normalizePackageCategoryKey(categoryId);
  return packages.filter(
    (pkg) => normalizePackageCategoryKey(pkg.categoryName) === categoryKey,
  );
}

/** Priced tiers shown in the admin category table. */
export function configuredPackagesInCategory(
  packages: readonly AdminPackageRow[],
  categoryId: string,
): AdminPackageRow[] {
  return packagesInCategory(packages, categoryId).filter((pkg) => pkg.priceCents > 0);
}

export function categoryHasConfiguredPackages(
  packages: readonly AdminPackageRow[],
  categoryId: string,
): boolean {
  return configuredPackagesInCategory(packages, categoryId).length > 0;
}
