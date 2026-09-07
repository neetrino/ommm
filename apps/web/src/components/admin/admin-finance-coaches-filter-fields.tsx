import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { CoachFinanceFilters } from "@/components/admin/admin-finance-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";

type BuildAdminFinanceCoachesFilterFieldsArgs = {
  labels: {
    monthLabel: string;
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

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

function monthToDatePickerValue(month: string): string {
  return YEAR_MONTH_PATTERN.test(month) ? `${month}-01` : "";
}

function datePickerValueToMonth(isoDate: string): string {
  const trimmed = isoDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "";
  }
  return trimmed.slice(0, 7);
}

export function adminFinanceCoachesIntegratedFilterValues(
  values: Pick<CoachFinanceFilters, "month" | "payoutStatus" | "order" | "quick">,
): Record<string, string> {
  return {
    month: values.month,
    payoutStatus: values.payoutStatus || "all",
    order: values.order,
    quick: values.quick || "all",
  };
}

export function buildAdminFinanceCoachesFilterFields({
  labels,
}: BuildAdminFinanceCoachesFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "month",
      label: labels.monthLabel,
      fieldType: "custom",
      resolveChipLabel: (value) =>
        formatFilterDateChipLabel(labels.monthLabel, monthToDatePickerValue(value)),
      render: ({ value, onChange }) => (
        <DatePickerInput
          name="month"
          value={monthToDatePickerValue(value)}
          onChange={(next) => onChange(datePickerValueToMonth(next))}
          ariaLabel={labels.monthLabel}
          placeholder={labels.monthLabel}
        />
      ),
    },
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
    case "month":
      return { ...current, month: value };
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
