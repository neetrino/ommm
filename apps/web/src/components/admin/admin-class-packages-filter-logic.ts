import {
  HIGH_CAPACITY_THRESHOLD,
  LOW_CAPACITY_THRESHOLD,
  hasLevelKeyword,
  levelMatchesFilter,
} from "@/components/admin/admin-class-package-stats";
import type {
  ClassPackageQuickFilter,
  ClassPackageSortOrder,
  EnrichedClassPackage,
} from "@/components/admin/admin-class-packages-types";
import type { ClassPackageFilterValues } from "@/components/admin/admin-class-packages-filters";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";

export function countActivePackageFilters(values: ClassPackageFilterValues): number {
  return [
    values.search.trim(),
    values.level.trim(),
    values.coachId.trim(),
    values.quick,
    values.order === "newest" ? "" : values.order,
  ].filter(Boolean).length;
}

export function filterClassPackages(
  packages: readonly EnrichedClassPackage[],
  values: ClassPackageFilterValues,
): EnrichedClassPackage[] {
  const search = values.search.trim().toLowerCase();

  return packages.filter((pkg) => {
    if (search.length > 0) {
      const coachNames = pkg.assignedCoaches
        .map((coach) =>
          coachCardDisplayName({
            name: coach.user.name,
            lastName: coach.user.lastName,
            email: coach.user.email,
            avatarUrl: null,
          }).toLowerCase(),
        )
        .join(" ");
      const haystack = [pkg.name, pkg.description ?? "", pkg.slug, coachNames]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (!levelMatchesFilter(pkg.sessionStats.levels, values.level)) {
      return false;
    }

    if (values.coachId.trim().length > 0) {
      const hasCoach = pkg.assignedCoaches.some((coach) => coach.id === values.coachId);
      if (!hasCoach) {
        return false;
      }
    }

    if (!matchesQuickFilter(pkg, values.quick)) {
      return false;
    }

    return true;
  });
}

function matchesQuickFilter(
  pkg: EnrichedClassPackage,
  quick: ClassPackageQuickFilter,
): boolean {
  if (quick === "") {
    return true;
  }
  const stats = pkg.sessionStats;
  switch (quick) {
    case "popular":
      return stats.totalBookings > 0;
    case "highCapacity":
      return stats.maxCapacity !== null && stats.maxCapacity >= HIGH_CAPACITY_THRESHOLD;
    case "lowCapacity":
      return stats.maxCapacity !== null && stats.maxCapacity <= LOW_CAPACITY_THRESHOLD;
    case "beginner":
      return hasLevelKeyword(stats.levels, "beginner");
    case "advanced":
      return hasLevelKeyword(stats.levels, "advanced");
    case "withCoaches":
      return pkg.assignedCoaches.length > 0;
    default:
      return true;
  }
}

export function sortClassPackages(
  packages: readonly EnrichedClassPackage[],
  order: ClassPackageSortOrder,
): EnrichedClassPackage[] {
  const rows = [...packages];
  rows.sort((a, b) => {
    switch (order) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "capacityHigh": {
        const av = a.sessionStats.maxCapacity ?? -1;
        const bv = b.sessionStats.maxCapacity ?? -1;
        return bv - av;
      }
      case "capacityLow": {
        const av = a.sessionStats.minCapacity ?? Number.MAX_SAFE_INTEGER;
        const bv = b.sessionStats.minCapacity ?? Number.MAX_SAFE_INTEGER;
        return av - bv;
      }
      case "priceHigh": {
        const av = a.sessionStats.maxPriceCents ?? -1;
        const bv = b.sessionStats.maxPriceCents ?? -1;
        return bv - av;
      }
      case "priceLow": {
        const av = a.sessionStats.minPriceCents ?? Number.MAX_SAFE_INTEGER;
        const bv = b.sessionStats.minPriceCents ?? Number.MAX_SAFE_INTEGER;
        return av - bv;
      }
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return rows;
}
