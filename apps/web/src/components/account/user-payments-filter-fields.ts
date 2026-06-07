import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";

export type UserPaymentSortOrder = "newest" | "oldest";
export type UserPaymentStatusFilter = "all" | "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED";
export type UserPaymentSourceFilter = "all" | "package" | "membership" | "dropin" | "gift" | "other";

export type UserPaymentFilterValues = {
  search: string;
  status: UserPaymentStatusFilter;
  source: UserPaymentSourceFilter;
  order: UserPaymentSortOrder;
};

const PAYMENT_STATUS_OPTIONS: readonly Exclude<UserPaymentStatusFilter, "all">[] = [
  "SUCCEEDED",
  "PENDING",
  "FAILED",
  "REFUNDED",
];

const PAYMENT_SOURCE_OPTIONS: readonly Exclude<UserPaymentSourceFilter, "all">[] = [
  "package",
  "membership",
  "dropin",
  "gift",
  "other",
];

type BuildUserPaymentsFilterFieldsArgs = {
  labels: {
    status: string;
    allStatuses: string;
    statusValues: Record<Exclude<UserPaymentStatusFilter, "all">, string>;
    type: string;
    allTypes: string;
    sourceValues: Record<Exclude<UserPaymentSourceFilter, "all">, string>;
    sort: string;
    sortLabels: Record<UserPaymentSortOrder, string>;
  };
};

export function userPaymentsIntegratedFilterValues(
  values: Omit<UserPaymentFilterValues, "search">,
): Record<string, string> {
  return {
    status: values.status,
    source: values.source,
    order: values.order,
  };
}

export function buildUserPaymentsFilterFields({
  labels,
}: BuildUserPaymentsFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.allStatuses,
      options: PAYMENT_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: labels.statusValues[status],
      })),
    },
    {
      key: "source",
      label: labels.type,
      emptyValue: "all",
      allLabel: labels.allTypes,
      options: PAYMENT_SOURCE_OPTIONS.map((source) => ({
        value: source,
        label: labels.sourceValues[source],
      })),
    },
    {
      key: "order",
      label: labels.sort,
      emptyValue: "newest",
      options: (["newest", "oldest"] as const).map((order) => ({
        value: order,
        label: labels.sortLabels[order],
      })),
    },
  ];
}
