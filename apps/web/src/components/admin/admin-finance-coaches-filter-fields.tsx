import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { CoachFinanceFilters } from "@/components/admin/admin-finance-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";

type BuildAdminFinanceCoachesFilterFieldsArgs = {
  labels: {
    dateFrom: string;
    dateTo: string;
    payoutStatusLabel: string;
    filterAll: string;
    statusPaid: string;
    statusPending: string;
    statusNone: string;
    sortLabel: string;
    sortHighestSalary: string;
    sortOldest: string;
    quickLabel: string;
    quickPaid: string;
    quickPending: string;
    quickHighSalary: string;
    quickRecent: string;
  };
};

function buildCoachesDateFilterField(
  key: "from" | "to",
  label: string,
): AdminIntegratedFilterField {
  return {
    key,
    label,
    fieldType: "date",
    emptyValue: "",
    resolveChipLabel: (value) => formatFilterDateChipLabel(label, value),
  };
}

export function adminFinanceCoachesIntegratedFilterValues(
  values: Pick<CoachFinanceFilters, "from" | "to" | "payoutStatus" | "order" | "quick">,
): Record<string, string> {
  return {
    from: values.from,
    to: values.to,
    payoutStatus: values.payoutStatus || "all",
    order: values.order,
    quick: values.quick || "all",
  };
}

export function buildAdminFinanceCoachesFilterFields({
  labels,
}: BuildAdminFinanceCoachesFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    buildCoachesDateFilterField("from", labels.dateFrom),
    buildCoachesDateFilterField("to", labels.dateTo),
    {
      key: "quick",
      label: labels.quickLabel,
      emptyValue: "all",
      allLabel: labels.filterAll,
      options: [
        { value: "paid", label: labels.quickPaid },
        { value: "pending", label: labels.quickPending },
        { value: "high-salary", label: labels.quickHighSalary },
        { value: "recent-payments", label: labels.quickRecent },
      ],
    },
    {
      key: "payoutStatus",
      label: labels.payoutStatusLabel,
      emptyValue: "all",
      allLabel: labels.filterAll,
      options: [
        { value: "paid", label: labels.statusPaid },
        { value: "pending", label: labels.statusPending },
        { value: "none", label: labels.statusNone },
      ],
    },
    {
      key: "order",
      label: labels.sortLabel,
      emptyValue: "newest",
      resolveChipLabel: (value) =>
        value === "newest" ? null : `${labels.sortLabel}: ${value}`,
      options: [
        { value: "newest", label: labels.sortHighestSalary },
        { value: "highest-salary", label: labels.sortHighestSalary },
        { value: "oldest", label: labels.sortOldest },
      ],
    },
  ];
}

export function parseCoachesIntegratedFilterChange(
  key: string,
  value: string,
  current: CoachFinanceFilters,
): CoachFinanceFilters {
  switch (key) {
    case "from":
      return { ...current, from: value };
    case "to":
      return { ...current, to: value };
    case "quick":
      return { ...current, quick: value === "all" ? "" : value };
    case "payoutStatus":
      return { ...current, payoutStatus: value === "all" ? "" : value };
    case "order":
      return { ...current, order: value };
    default:
      return current;
  }
}
