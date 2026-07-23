import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { categoryPackagesToOptions } from "@/components/admin/package-category-utils";

export type FinancePaymentPackageFilterOption = {
  value: string;
  label: string;
};

export type FinancePaymentPackageFilterOptions = {
  planOptions: FinancePaymentPackageFilterOption[];
  classOptions: FinancePaymentPackageFilterOption[];
  sessionOptions: FinancePaymentPackageFilterOption[];
};

type BuildFinancePaymentPackageFilterOptionsArgs = {
  plans: readonly AdminPackageRow[];
  labels: {
    sessions: (count: number) => string;
    unlimited: string;
  };
};

function isPurchasablePackagePlan(plan: AdminPackageRow): boolean {
  return plan.priceCents > 0;
}

function sortPlansForFilter(left: AdminPackageRow, right: AdminPackageRow): number {
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

/** Builds package, class, and session filter options from admin package plans. */
export function buildFinancePaymentPackageFilterOptions({
  plans,
  labels,
}: BuildFinancePaymentPackageFilterOptionsArgs): FinancePaymentPackageFilterOptions {
  const purchasablePlans = plans.filter(isPurchasablePackagePlan).sort(sortPlansForFilter);

  const planOptions = purchasablePlans.map((plan) => ({
    value: plan.id,
    label: formatPackagePlanName(plan.name, plan.sessionsPerMonth),
  }));

  const classOptions = categoryPackagesToOptions(plans).map((option) => ({
    value: option.label,
    label: option.label,
  }));

  const sessionCounts = new Set<number>();
  let hasUnlimited = false;
  for (const plan of purchasablePlans) {
    if (plan.isUnlimited) {
      hasUnlimited = true;
      continue;
    }
    if (plan.sessionsPerMonth !== null && plan.sessionsPerMonth > 0) {
      sessionCounts.add(plan.sessionsPerMonth);
    }
  }

  const sessionOptions: FinancePaymentPackageFilterOption[] = [
    ...[...sessionCounts]
      .sort((left, right) => left - right)
      .map((count) => ({
        value: String(count),
        label: labels.sessions(count),
      })),
    ...(hasUnlimited
      ? [{ value: "unlimited", label: labels.unlimited }]
      : []),
  ];

  return { planOptions, classOptions, sessionOptions };
}
