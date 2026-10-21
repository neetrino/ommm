import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";

export type CouponPackagePlanOption = {
  value: string;
  label: string;
};

export type CouponPackagePlanSource = Pick<
  AdminPackageRow,
  | "id"
  | "name"
  | "categoryName"
  | "sessionsPerMonth"
  | "isUnlimited"
  | "isActive"
  | "displayOrder"
>;

type CouponPackagePlanLabels = {
  sessions: (count: number) => string;
  unlimited: string;
  inactive: string;
  missing: string;
};

/** Dropdown rows: active plans first, then any saved id the list no longer contains. */
export function couponPackagePlanOptions(
  plans: readonly CouponPackagePlanSource[],
  selectedIds: readonly string[],
  labels: CouponPackagePlanLabels,
): CouponPackagePlanOption[] {
  const options = [...plans]
    .sort(compareCouponPackagePlans)
    .map((plan) => ({ value: plan.id, label: couponPackagePlanLabel(plan, labels) }));
  const known = new Set(options.map((option) => option.value));
  for (const id of selectedIds) {
    if (known.has(id)) {
      continue;
    }
    options.push({ value: id, label: labels.missing });
    known.add(id);
  }
  return options;
}

function compareCouponPackagePlans(
  left: CouponPackagePlanSource,
  right: CouponPackagePlanSource,
): number {
  if (left.isActive !== right.isActive) {
    return left.isActive ? -1 : 1;
  }
  const category = left.categoryName.localeCompare(right.categoryName);
  if (category !== 0) {
    return category;
  }
  if (left.displayOrder !== right.displayOrder) {
    return left.displayOrder - right.displayOrder;
  }
  return left.name.localeCompare(right.name);
}

function couponPackagePlanLabel(
  plan: CouponPackagePlanSource,
  labels: CouponPackagePlanLabels,
): string {
  const name = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
  const category = plan.categoryName.trim();
  const titled =
    category.length > 0 && category.toLowerCase() !== name.toLowerCase()
      ? `${category} — ${name}`
      : name;
  const detail = sessionDetail(plan, labels);
  const withDetail = detail.length > 0 ? `${titled} · ${detail}` : titled;
  return plan.isActive ? withDetail : `${withDetail} · ${labels.inactive}`;
}

function sessionDetail(plan: CouponPackagePlanSource, labels: CouponPackagePlanLabels): string {
  if (plan.isUnlimited) {
    return labels.unlimited;
  }
  if (plan.sessionsPerMonth !== null && plan.sessionsPerMonth > 0) {
    return labels.sessions(plan.sessionsPerMonth);
  }
  return "";
}
