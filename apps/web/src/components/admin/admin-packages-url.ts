import type {
  PackageFilterValues,
  PackageSortOrder,
  PackageStatusFilter,
} from "@/components/admin/admin-packages-types";

export const PACKAGE_FILTER_QUERY_KEYS = ["search", "status", "order"] as const;

const SORT_ORDERS: readonly PackageSortOrder[] = [
  "displayOrder",
  "newest",
  "oldest",
  "priceHigh",
  "priceLow",
];

const STATUS_FILTERS: readonly PackageStatusFilter[] = ["all", "active", "inactive"];

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parsePackageSortOrder(
  value: string | string[] | undefined,
): PackageSortOrder {
  const raw = firstParam(value);
  return SORT_ORDERS.includes(raw as PackageSortOrder)
    ? (raw as PackageSortOrder)
    : "displayOrder";
}

export function parsePackageStatusFilter(
  value: string | string[] | undefined,
): PackageStatusFilter {
  const raw = firstParam(value);
  return STATUS_FILTERS.includes(raw as PackageStatusFilter)
    ? (raw as PackageStatusFilter)
    : "all";
}

export function parsePackageFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): PackageFilterValues {
  return {
    search: firstParam(search.search)?.trim() ?? "",
    status: parsePackageStatusFilter(search.status),
    order: parsePackageSortOrder(search.order),
  };
}

export function buildPackageFiltersQuery(values: PackageFilterValues): string {
  const params = new URLSearchParams();
  if (values.search.trim().length > 0) {
    params.set("search", values.search.trim());
  }
  if (values.status !== "all") {
    params.set("status", values.status);
  }
  if (values.order !== "displayOrder") {
    params.set("order", values.order);
  }
  return params.toString();
}

export function packageFiltersQueryKey(values: PackageFilterValues): string {
  return [values.search, values.status, values.order].join("|");
}
