import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { PACKAGES_SOLD_PLAN_ALL } from "@/components/admin/admin-packages-sold";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";

export type SoldPackagePlanFilterOption = {
  value: string;
  label: string;
};

type BuildSoldPackagesFilterFieldsArgs = {
  labels: {
    package: string;
    packageAll: string;
    packageEmpty: string;
  };
  planOptions: readonly SoldPackagePlanFilterOption[];
};

export function soldPackagePlanFilterOptions(
  plans: readonly AdminPackageRow[],
): SoldPackagePlanFilterOption[] {
  return [...plans]
    .sort((left, right) => {
      const categoryCompare = left.categoryName.localeCompare(right.categoryName);
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      const orderCompare = left.displayOrder - right.displayOrder;
      if (orderCompare !== 0) {
        return orderCompare;
      }
      return left.name.localeCompare(right.name);
    })
    .map((plan) => ({
      value: plan.id,
      label: formatPackagePlanName(plan.name, plan.sessionsPerMonth),
    }));
}

export function buildSoldPackagesFilterFields({
  labels,
  planOptions,
}: BuildSoldPackagesFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: "planId",
      label: labels.package,
      emptyValue: PACKAGES_SOLD_PLAN_ALL,
      allLabel: planOptions.length > 0 ? labels.packageAll : labels.packageEmpty,
      options: planOptions,
    },
  ];
}
