import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { FinanceFilterValues } from "@/components/admin/admin-finance-types";

type BuildAdminFinanceFilterFieldsArgs = {
  labels: {
    rangeLabel: string;
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
  };
};

export function adminFinanceIntegratedFilterValues(
  values: Omit<FinanceFilterValues, "q">,
): Record<string, string> {
  return {
    rangeDays: String(values.rangeDays),
    source: values.source,
    status: values.status,
  };
}

export function buildAdminFinanceFilterFields({
  labels,
}: BuildAdminFinanceFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "rangeDays",
      label: labels.rangeLabel,
      emptyValue: "30",
      resolveChipLabel: (value) => {
        if (value === "30") {
          return null;
        }
        const rangeLabels: Record<string, string> = {
          "7": labels.range7,
          "90": labels.range90,
        };
        return rangeLabels[value]
          ? `${labels.rangeLabel}: ${rangeLabels[value]}`
          : `${labels.rangeLabel}: ${value}`;
      },
      options: [
        { value: "7", label: labels.range7 },
        { value: "30", label: labels.range30 },
        { value: "90", label: labels.range90 },
      ],
    },
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
