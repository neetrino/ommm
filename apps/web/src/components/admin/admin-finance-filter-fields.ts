import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import {
  DEFAULT_FINANCE_OVERVIEW_RANGE,
  type FinanceBoundedDateRangeDays,
  type FinanceSourceFilter,
  type FinanceStatusFilter,
} from "@/components/admin/admin-finance-types";

type BuildAdminFinanceFilterFieldsArgs = {
  labels: {
    rangeLabel?: string;
    rangeAll?: string;
    range7?: string;
    range30?: string;
    range90?: string;
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
  };
  includeRange?: boolean;
};

export function adminFinanceIntegratedFilterValues(values: {
  rangeDays: FinanceBoundedDateRangeDays;
  source: FinanceSourceFilter;
  status: FinanceStatusFilter;
}): Record<string, string> {
  return {
    rangeDays: String(values.rangeDays),
    source: values.source,
    status: values.status,
  };
}

function buildRangeFilterField(labels: BuildAdminFinanceFilterFieldsArgs["labels"]): AdminIntegratedFilterField {
  const includeAll = Boolean(labels.rangeAll);
  const emptyValue = includeAll ? "all" : String(DEFAULT_FINANCE_OVERVIEW_RANGE);
  const rangeLabel = labels.rangeLabel ?? "";
  const rangeLabels: Record<string, string> = {
    ...(labels.rangeAll ? { all: labels.rangeAll } : {}),
    ...(labels.range7 ? { "7": labels.range7 } : {}),
    ...(labels.range30 ? { "30": labels.range30 } : {}),
    ...(labels.range90 ? { "90": labels.range90 } : {}),
  };
  return {
    key: "rangeDays",
    label: rangeLabel,
    emptyValue,
    allLabel: labels.rangeAll,
    resolveChipLabel: (value) => {
      if (value === emptyValue) {
        return null;
      }
      const selectedLabel = rangeLabels[value];
      return selectedLabel
        ? `${rangeLabel}: ${selectedLabel}`
        : `${rangeLabel}: ${value}`;
    },
    options: [
      ...(labels.rangeAll ? [{ value: "all", label: labels.rangeAll }] : []),
      ...(labels.range7 ? [{ value: "7", label: labels.range7 }] : []),
      ...(labels.range30 ? [{ value: "30", label: labels.range30 }] : []),
      ...(labels.range90 ? [{ value: "90", label: labels.range90 }] : []),
    ],
  };
}

export function buildAdminFinanceFilterFields({
  labels,
  includeRange = true,
}: BuildAdminFinanceFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    ...(includeRange ? [buildRangeFilterField(labels)] : []),
    {
      key: "source",
      label: labels.sourceLabel,
      emptyValue: "all",
      allLabel: labels.sourceAll,
      options: [
        { value: "package", label: labels.sourcePackage },
        { value: "dropin", label: labels.sourceDropIn },
        { value: "gift", label: labels.sourceGift },
        { value: "other", label: labels.sourceOther },
      ],
    },
    {
      key: "status",
      label: labels.statusLabel,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: [
        { value: "SUCCEEDED", label: labels.statusSucceeded },
        { value: "FAILED", label: labels.statusFailed },
        { value: "PENDING", label: labels.statusPending },
        { value: "REFUNDED", label: labels.statusRefunded },
      ],
    },
  ];
}
