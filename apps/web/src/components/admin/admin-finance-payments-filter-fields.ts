import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { buildAdminFinanceFilterFields } from "@/components/admin/admin-finance-filter-fields";
import {
  FINANCE_PAYMENT_METHOD_FILTER_VALUES,
  type FinanceFilterValues,
} from "@/components/admin/admin-finance-types";
import type { FinancePaymentPackageFilterOptions } from "@/components/admin/admin-finance-payments-package-filter-options";
import { buildDateSortFilterField } from "@/lib/list-sort";

type BuildAdminFinancePaymentsFilterFieldsArgs = {
  labels: {
    rangeLabel: string;
    rangeAll: string;
    range7: string;
    range30: string;
    range90: string;
    sourceLabel: string;
    sourceAll: string;
    sourcePackage: string;
    sourceDropIn: string;
    sourceGift: string;
    sourceOther: string;
    statusLabel: string;
    statusAll: string;
    statusSucceeded: string;
    statusFailed: string;
    statusPending: string;
    statusRefunded: string;
    paymentMethodLabel: string;
    paymentMethodAll: string;
    paymentMethodCash: string;
    paymentMethodCard: string;
    paymentMethodTerminal: string;
    packageLabel: string;
    packageAll: string;
    packageClassLabel: string;
    packageClassAll: string;
    sessionsLabel: string;
    sessionsAll: string;
    noPackages: string;
    noClasses: string;
    noSessions: string;
    sort: string;
    sortNewest: string;
    sortOldest: string;
  };
  packageOptions: FinancePaymentPackageFilterOptions;
};

export function adminFinancePaymentsIntegratedFilterValues(
  values: Pick<
    FinanceFilterValues,
    | "rangeDays"
    | "source"
    | "status"
    | "paymentMethod"
    | "planId"
    | "packageClass"
    | "sessions"
    | "order"
  >,
): Record<string, string> {
  return {
    rangeDays: String(values.rangeDays),
    source: values.source,
    status: values.status,
    paymentMethod: values.paymentMethod,
    planId: values.planId,
    packageClass: values.packageClass,
    sessions: values.sessions,
    order: values.order,
  };
}

function paymentMethodOptionLabel(
  value: (typeof FINANCE_PAYMENT_METHOD_FILTER_VALUES)[number],
  labels: Pick<
    BuildAdminFinancePaymentsFilterFieldsArgs["labels"],
    "paymentMethodCash" | "paymentMethodCard" | "paymentMethodTerminal"
  >,
): string {
  if (value === "CASH") {
    return labels.paymentMethodCash;
  }
  if (value === "CARD") {
    return labels.paymentMethodCard;
  }
  return labels.paymentMethodTerminal;
}

function buildPaymentMethodFilterField(
  labels: Pick<
    BuildAdminFinancePaymentsFilterFieldsArgs["labels"],
    | "paymentMethodLabel"
    | "paymentMethodAll"
    | "paymentMethodCash"
    | "paymentMethodCard"
    | "paymentMethodTerminal"
  >,
): AdminIntegratedFilterField {
  return {
    key: "paymentMethod",
    label: labels.paymentMethodLabel,
    emptyValue: "all",
    allLabel: labels.paymentMethodAll,
    options: FINANCE_PAYMENT_METHOD_FILTER_VALUES.map((value) => ({
      value,
      label: paymentMethodOptionLabel(value, labels),
    })),
  };
}

function buildPackageFilterField(
  key: "planId" | "packageClass" | "sessions",
  label: string,
  allLabel: string,
  emptyLabel: string,
  options: FinancePaymentPackageFilterOptions["planOptions"],
): AdminIntegratedFilterField {
  return {
    key,
    label,
    emptyValue: "all",
    allLabel: options.length > 0 ? allLabel : emptyLabel,
    resolveChipLabel: (value) => {
      if (value === "all") {
        return null;
      }
      const option = options.find((item) => item.value === value);
      return option ? `${label}: ${option.label}` : `${label}: ${value}`;
    },
    options,
  };
}

export function buildAdminFinancePaymentsFilterFields({
  labels,
  packageOptions,
}: BuildAdminFinancePaymentsFilterFieldsArgs): AdminIntegratedFilterField[] {
  const baseFields = buildAdminFinanceFilterFields({
    labels: {
      rangeLabel: labels.rangeLabel,
      rangeAll: labels.rangeAll,
      range7: labels.range7,
      range30: labels.range30,
      range90: labels.range90,
      sourceLabel: labels.sourceLabel,
      sourceAll: labels.sourceAll,
      sourcePackage: labels.sourcePackage,
      sourceDropIn: labels.sourceDropIn,
      sourceGift: labels.sourceGift,
      sourceOther: labels.sourceOther,
      statusLabel: labels.statusLabel,
      statusAll: labels.statusAll,
      statusSucceeded: labels.statusSucceeded,
      statusFailed: labels.statusFailed,
      statusPending: labels.statusPending,
      statusRefunded: labels.statusRefunded,
    },
  });

  return [
    ...baseFields,
    buildPaymentMethodFilterField(labels),
    buildPackageFilterField(
      "planId",
      labels.packageLabel,
      labels.packageAll,
      labels.noPackages,
      packageOptions.planOptions,
    ),
    buildPackageFilterField(
      "packageClass",
      labels.packageClassLabel,
      labels.packageClassAll,
      labels.noClasses,
      packageOptions.classOptions,
    ),
    buildPackageFilterField(
      "sessions",
      labels.sessionsLabel,
      labels.sessionsAll,
      labels.noSessions,
      packageOptions.sessionOptions,
    ),
    buildDateSortFilterField(labels.sort, {
      newest: labels.sortNewest,
      oldest: labels.sortOldest,
    }),
  ];
}
