import type { ClassPackageFilterValues } from "@/components/admin/admin-class-packages-filters";
import type {
  ClassPackageQuickFilter,
  ClassPackageSortOrder,
} from "@/components/admin/admin-class-packages-types";

export const PACKAGE_FILTER_QUERY_KEYS = [
  "search",
  "level",
  "coachId",
  "order",
  "quick",
] as const;

const SORT_ORDERS: readonly ClassPackageSortOrder[] = [
  "newest",
  "oldest",
  "capacityHigh",
  "capacityLow",
  "priceHigh",
  "priceLow",
];

const QUICK_FILTERS: readonly ClassPackageQuickFilter[] = [
  "",
  "popular",
  "highCapacity",
  "lowCapacity",
  "beginner",
  "advanced",
  "withCoaches",
];

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parsePackageSortOrder(
  value: string | string[] | undefined,
): ClassPackageSortOrder {
  const raw = firstParam(value);
  return SORT_ORDERS.includes(raw as ClassPackageSortOrder)
    ? (raw as ClassPackageSortOrder)
    : "newest";
}

export function parsePackageQuickFilter(
  value: string | string[] | undefined,
): ClassPackageQuickFilter {
  const raw = firstParam(value);
  return QUICK_FILTERS.includes(raw as ClassPackageQuickFilter)
    ? (raw as ClassPackageQuickFilter)
    : "";
}

export function parsePackageFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): ClassPackageFilterValues {
  return {
    search: firstParam(search.search)?.trim() ?? "",
    level: firstParam(search.level)?.trim() ?? "",
    coachId: firstParam(search.coachId)?.trim() ?? "",
    order: parsePackageSortOrder(search.order),
    quick: parsePackageQuickFilter(search.quick),
  };
}

export function buildPackageFiltersQuery(values: ClassPackageFilterValues): string {
  const params = new URLSearchParams();
  if (values.search.trim().length > 0) {
    params.set("search", values.search.trim());
  }
  if (values.level.trim().length > 0) {
    params.set("level", values.level.trim());
  }
  if (values.coachId.trim().length > 0) {
    params.set("coachId", values.coachId.trim());
  }
  if (values.order !== "newest") {
    params.set("order", values.order);
  }
  if (values.quick.length > 0) {
    params.set("quick", values.quick);
  }
  return params.toString();
}

export function packageFiltersQueryKey(values: ClassPackageFilterValues): string {
  return [
    values.search,
    values.level,
    values.coachId,
    values.order,
    values.quick,
  ].join("|");
}
