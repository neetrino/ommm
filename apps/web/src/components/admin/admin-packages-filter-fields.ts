import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import type { PackageFilterValues, PackageSortOrder } from "@/components/admin/admin-packages-types";

const SORT_OPTIONS: readonly PackageSortOrder[] = [
  "displayOrder",
  "newest",
  "oldest",
  "priceHigh",
  "priceLow",
];

type BuildAdminPackagesFilterFieldsArgs = {
  labels: {
    status: string;
    statusAll: string;
    statusActive: string;
    statusInactive: string;
    sort: string;
    sortLabels: Record<PackageSortOrder, string>;
  };
};

export function adminPackagesIntegratedFilterValues(
  values: Omit<PackageFilterValues, "search">,
): Record<string, string> {
  return {
    status: values.status,
    order: values.order,
  };
}

export function buildAdminPackagesFilterFields({
  labels,
}: BuildAdminPackagesFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: [
        { value: "active", label: labels.statusActive },
        { value: "inactive", label: labels.statusInactive },
      ],
    },
    {
      key: "order",
      label: labels.sort,
      emptyValue: "displayOrder",
      options: SORT_OPTIONS.map((option) => ({
        value: option,
        label: labels.sortLabels[option],
      })),
    },
  ];
}
