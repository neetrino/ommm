import type {
  AdminPackageRow,
  PackageFilterValues,
  PackageSortOrder,
  PackageStatusFilter,
} from "@/components/admin/admin-packages-types";

/** Searchable text for a package row (name, category, description, features). */
export function buildPackageSearchHaystack(pkg: AdminPackageRow): string {
  const features = Array.isArray(pkg.features) ? pkg.features : [];
  return [
    pkg.name,
    pkg.categoryName,
    pkg.description ?? "",
    ...features,
    pkg.billingPeriod,
  ]
    .join(" ")
    .toLowerCase();
}

function buildCategoryShellHaystacks(
  packages: readonly AdminPackageRow[],
): Map<string, string> {
  const haystacks = new Map<string, string>();
  for (const pkg of packages) {
    if (pkg.priceCents > 0) {
      continue;
    }
    const key = pkg.categorySlug;
    const current = haystacks.get(key) ?? "";
    haystacks.set(key, `${current} ${buildPackageSearchHaystack(pkg)}`.trim());
  }
  return haystacks;
}

function matchesPackageStatus(
  pkg: AdminPackageRow,
  status: PackageStatusFilter,
): boolean {
  if (status === "active" && !pkg.isActive) {
    return false;
  }
  if (status === "inactive" && pkg.isActive) {
    return false;
  }
  return true;
}

function packageMatchesSearch(
  pkg: AdminPackageRow,
  search: string,
  categoryShellHaystacks: ReadonlyMap<string, string>,
): boolean {
  const combined = [
    buildPackageSearchHaystack(pkg),
    categoryShellHaystacks.get(pkg.categorySlug) ?? "",
  ]
    .join(" ")
    .trim();
  return combined.includes(search);
}

export function countActivePackageFilters(values: PackageFilterValues): number {
  return [
    values.search.trim(),
    values.status === "all" ? "" : values.status,
    values.order === "displayOrder" ? "" : values.order,
  ].filter(Boolean).length;
}

export function hasActivePackageFilters(values: PackageFilterValues): boolean {
  return countActivePackageFilters(values) > 0;
}

export function filterPackages(
  packages: readonly AdminPackageRow[],
  values: PackageFilterValues,
): AdminPackageRow[] {
  const search = values.search.trim().toLowerCase();
  const categoryShellHaystacks =
    search.length > 0 ? buildCategoryShellHaystacks(packages) : new Map<string, string>();

  const categoryKeysMatchingShell = new Set<string>();
  if (search.length > 0) {
    for (const [categoryKey, haystack] of categoryShellHaystacks) {
      if (haystack.includes(search)) {
        categoryKeysMatchingShell.add(categoryKey);
      }
    }
  }

  return packages.filter((pkg) => {
    if (!matchesPackageStatus(pkg, values.status)) {
      return false;
    }
    if (search.length === 0) {
      return true;
    }
    if (packageMatchesSearch(pkg, search, categoryShellHaystacks)) {
      return true;
    }
    if (
      categoryKeysMatchingShell.has(pkg.categorySlug) &&
      pkg.priceCents > 0
    ) {
      return true;
    }
    return false;
  });
}

export function sortPackages(
  packages: readonly AdminPackageRow[],
  order: PackageSortOrder,
): AdminPackageRow[] {
  const rows = [...packages];
  rows.sort((a, b) => {
    switch (order) {
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "priceHigh":
        return b.priceCents - a.priceCents;
      case "priceLow":
        return a.priceCents - b.priceCents;
      case "displayOrder":
      default:
        return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
    }
  });
  return rows;
}

export function formatPackageSessionsLabel(
  pkg: AdminPackageRow,
  labels: { unlimited: string; sessions: (count: number) => string },
): string {
  if (pkg.isUnlimited) {
    return labels.unlimited;
  }
  if (pkg.sessionsPerMonth !== null && pkg.sessionsPerMonth > 0) {
    return labels.sessions(pkg.sessionsPerMonth);
  }
  return "—";
}
