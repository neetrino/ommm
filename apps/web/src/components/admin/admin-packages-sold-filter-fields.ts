import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  PACKAGES_SOLD_CATEGORY_ALL,
  PACKAGES_SOLD_CATEGORY_QUERY_KEY,
  PACKAGES_SOLD_PLAN_ALL,
  PACKAGES_SOLD_PLAN_QUERY_KEY,
} from "@/components/admin/admin-packages-sold";
import { categoryPackagesToOptions } from "@/components/admin/package-category-utils";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";

export type SoldPackageSelectFilterOption = {
  value: string;
  label: string;
};

type SoldPackagesFilterLabels = {
  category: string;
  categoryAll: string;
  categoryEmpty: string;
  package: string;
  packageAll: string;
  packageEmpty: string;
};

type BuildSoldPackagesFilterFieldsArgs = {
  labels: SoldPackagesFilterLabels;
  categoryOptions: readonly SoldPackageSelectFilterOption[];
  planOptions: readonly SoldPackageSelectFilterOption[];
};

export function soldPackageCategoryFilterOptions(
  plans: readonly AdminPackageRow[],
): SoldPackageSelectFilterOption[] {
  return categoryPackagesToOptions(plans).map((option) => ({
    value: option.id,
    label: option.label,
  }));
}

export function soldPackagePlanFilterOptions(
  plans: readonly AdminPackageRow[],
  categorySlug: string = PACKAGES_SOLD_CATEGORY_ALL,
): SoldPackageSelectFilterOption[] {
  const scoped = plansForSoldPackageCategory(plans, categorySlug);
  return [...scoped]
    .sort(compareSoldPackagePlans)
    .map((plan) => ({
      value: plan.id,
      label: formatPackagePlanName(plan.name, plan.sessionsPerMonth),
    }));
}

export function planBelongsToSoldPackageCategory(
  plans: readonly AdminPackageRow[],
  planId: string,
  categorySlug: string,
): boolean {
  const trimmedPlanId = planId.trim();
  if (trimmedPlanId.length === 0 || trimmedPlanId === PACKAGES_SOLD_PLAN_ALL) {
    return true;
  }
  return plansForSoldPackageCategory(plans, categorySlug).some(
    (plan) => plan.id === trimmedPlanId,
  );
}

export function normalizeSoldPackagesDraftChange(
  plans: readonly AdminPackageRow[],
  previous: Record<string, string>,
  key: string,
  value: string,
): Record<string, string> {
  const next = { ...previous, [key]: value };
  if (key !== PACKAGES_SOLD_CATEGORY_QUERY_KEY) {
    return next;
  }
  const planId = previous[PACKAGES_SOLD_PLAN_QUERY_KEY] ?? PACKAGES_SOLD_PLAN_ALL;
  if (!planBelongsToSoldPackageCategory(plans, planId, value)) {
    next[PACKAGES_SOLD_PLAN_QUERY_KEY] = PACKAGES_SOLD_PLAN_ALL;
  }
  return next;
}

export function buildSoldPackagesFilterFields({
  labels,
  categoryOptions,
  planOptions,
}: BuildSoldPackagesFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: PACKAGES_SOLD_CATEGORY_QUERY_KEY,
      label: labels.category,
      emptyValue: PACKAGES_SOLD_CATEGORY_ALL,
      allLabel: categoryOptions.length > 0 ? labels.categoryAll : labels.categoryEmpty,
      options: categoryOptions,
    },
    {
      key: PACKAGES_SOLD_PLAN_QUERY_KEY,
      label: labels.package,
      emptyValue: PACKAGES_SOLD_PLAN_ALL,
      allLabel: planOptions.length > 0 ? labels.packageAll : labels.packageEmpty,
      options: planOptions,
    },
  ];
}

function plansForSoldPackageCategory(
  plans: readonly AdminPackageRow[],
  categorySlug: string,
): readonly AdminPackageRow[] {
  const slug = categorySlug.trim();
  if (slug.length === 0 || slug === PACKAGES_SOLD_CATEGORY_ALL) {
    return plans;
  }
  return plans.filter((plan) => plan.categorySlug === slug);
}

function compareSoldPackagePlans(left: AdminPackageRow, right: AdminPackageRow): number {
  const categoryCompare = left.categoryName.localeCompare(right.categoryName);
  if (categoryCompare !== 0) {
    return categoryCompare;
  }
  const orderCompare = left.displayOrder - right.displayOrder;
  if (orderCompare !== 0) {
    return orderCompare;
  }
  return left.name.localeCompare(right.name);
}
