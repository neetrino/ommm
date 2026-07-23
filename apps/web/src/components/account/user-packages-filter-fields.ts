import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import {
  buildUserPackageSortFilterField,
  type UserPackageSortOrder,
} from "@/lib/list-sort";
import type { UserMembershipRow, UserPackageStatus } from "@/lib/user-package-types";

export type UserPackageStatusFilter = "all" | UserPackageStatus;

export type UserPackageFilterValues = {
  search: string;
  status: UserPackageStatusFilter;
  order: UserPackageSortOrder;
};

export const DEFAULT_USER_PACKAGE_FILTER_VALUES: UserPackageFilterValues = {
  search: "",
  status: "all",
  order: "upcoming",
};

const PACKAGE_STATUS_OPTIONS: readonly Exclude<UserPackageStatusFilter, "all">[] = [
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
  "PENDING",
];

type BuildUserPackagesFilterFieldsArgs = {
  labels: {
    status: string;
    statusAll: string;
    statusValues: Record<Exclude<UserPackageStatusFilter, "all">, string>;
    searchPlaceholder: string;
    resetFilters: string;
    sort: string;
    sortUpcoming: string;
    sortNewest: string;
    sortOldest: string;
  };
};

export function userPackagesIntegratedFilterValues(
  values: Omit<UserPackageFilterValues, "search">,
): Record<string, string> {
  return { status: values.status, order: values.order };
}

export function buildUserPackagesFilterFields({
  labels,
}: BuildUserPackagesFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: PACKAGE_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: labels.statusValues[status],
      })),
    },
    buildUserPackageSortFilterField(labels.sort, {
      upcoming: labels.sortUpcoming,
      newest: labels.sortNewest,
      oldest: labels.sortOldest,
    }),
  ];
}

export function matchesUserPackageFilters(
  row: UserMembershipRow,
  filters: UserPackageFilterValues,
): boolean {
  const status = normalizeUserPackageStatus(row.status);
  if (filters.status !== "all" && status !== filters.status) {
    return false;
  }

  const search = filters.search.trim().toLowerCase();
  if (search.length === 0) {
    return true;
  }

  const haystack = `${row.plan.name} ${row.plan.categoryName}`.toLowerCase();
  return haystack.includes(search);
}

export function hasActiveUserPackageFilters(filters: UserPackageFilterValues): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.status !== "all" ||
    filters.order !== "upcoming"
  );
}
