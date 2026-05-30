import type {
  AdminPackageRow,
  PackageFilterValues,
  PackageSortOrder,
} from "@/components/admin/admin-packages-types";

export function countActivePackageFilters(values: PackageFilterValues): number {
  return [
    values.search.trim(),
    values.status === "all" ? "" : values.status,
    values.order === "displayOrder" ? "" : values.order,
  ].filter(Boolean).length;
}

export function filterPackages(
  packages: readonly AdminPackageRow[],
  values: PackageFilterValues,
): AdminPackageRow[] {
  const search = values.search.trim().toLowerCase();

  return packages.filter((pkg) => {
    if (values.status === "active" && !pkg.isActive) {
      return false;
    }
    if (values.status === "inactive" && pkg.isActive) {
      return false;
    }
    if (search.length > 0) {
      const haystack = [
        pkg.name,
        pkg.description ?? "",
        pkg.billingPeriod,
        ...pkg.features,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }
    return true;
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
