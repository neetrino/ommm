import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";
import { categoryPackagesToOptions } from "@/components/admin/package-category-utils";

/** Distinct package categories that have at least one plan (accordion + filter). */
export function buildPackageCategoryOptions(
  packages: readonly AdminPackageRow[],
): AdminPackagesCategoryOption[] {
  return categoryPackagesToOptions(packages);
}

export function packagesInCategory(
  packages: readonly AdminPackageRow[],
  categorySlug: string,
): AdminPackageRow[] {
  const normalizedSlug = categorySlug.trim();
  return packages.filter((pkg) => pkg.categorySlug === normalizedSlug);
}

/** Priced tiers shown in the admin category table. */
export function configuredPackagesInCategory(
  packages: readonly AdminPackageRow[],
  categorySlug: string,
): AdminPackageRow[] {
  return packagesInCategory(packages, categorySlug).filter((pkg) => pkg.priceCents > 0);
}

export function categoryHasConfiguredPackages(
  packages: readonly AdminPackageRow[],
  categorySlug: string,
): boolean {
  return configuredPackagesInCategory(packages, categorySlug).length > 0;
}

/** Category is enabled when every plan in the group is active. */
export function isPackageCategoryActive(
  packages: readonly AdminPackageRow[],
  categorySlug: string,
): boolean {
  const inCategory = packagesInCategory(packages, categorySlug);
  return inCategory.length > 0 && inCategory.every((pkg) => pkg.isActive);
}
