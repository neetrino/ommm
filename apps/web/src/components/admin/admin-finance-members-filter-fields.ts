import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { UserFinanceFilters } from "@/components/admin/admin-finance-types";

type BuildAdminFinanceMembersFilterFieldsArgs = {
  labels: {
    paymentStatusLabel: string;
    paymentStatusAll: string;
    statusPaid: string;
    statusUnpaid: string;
    statusOverdue: string;
    statusPartial: string;
    sortLabel: string;
    sortNewest: string;
    sortOldest: string;
    sortHighestCost: string;
    sortLowestCost: string;
    giftCardLabel: string;
    giftCardAll: string;
    giftCardOnly: string;
  };
};

export function adminFinanceMembersIntegratedFilterValues(
  values: Pick<UserFinanceFilters, "paymentStatus" | "order" | "giftCardOnly">,
): Record<string, string> {
  return {
    paymentStatus: values.paymentStatus || "all",
    order: values.order,
    giftCardOnly: values.giftCardOnly ? "true" : "all",
  };
}

export function buildAdminFinanceMembersFilterFields({
  labels,
}: BuildAdminFinanceMembersFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "paymentStatus",
      label: labels.paymentStatusLabel,
      emptyValue: "all",
      allLabel: labels.paymentStatusAll,
      options: [
        { value: "paid", label: labels.statusPaid },
        { value: "unpaid", label: labels.statusUnpaid },
        { value: "overdue", label: labels.statusOverdue },
        { value: "partial", label: labels.statusPartial },
      ],
    },
    {
      key: "order",
      label: labels.sortLabel,
      emptyValue: "newest",
      resolveChipLabel: (value) =>
        value === "newest" ? null : `${labels.sortLabel}: ${value}`,
      options: [
        { value: "newest", label: labels.sortNewest },
        { value: "oldest", label: labels.sortOldest },
        { value: "highest-lifetime-value", label: labels.sortHighestCost },
        { value: "lowest-lifetime-value", label: labels.sortLowestCost },
      ],
    },
    {
      key: "giftCardOnly",
      label: labels.giftCardLabel,
      emptyValue: "all",
      allLabel: labels.giftCardAll,
      options: [{ value: "true", label: labels.giftCardOnly }],
    },
  ];
}

export function parseMembersIntegratedFilterChange(
  key: string,
  value: string,
  current: UserFinanceFilters,
): UserFinanceFilters {
  switch (key) {
    case "paymentStatus":
      return { ...current, paymentStatus: value === "all" ? "" : value };
    case "order":
      return { ...current, order: value };
    case "giftCardOnly":
      return { ...current, giftCardOnly: value === "true" };
    default:
      return current;
  }
}
