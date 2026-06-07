import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { CoachFinanceFilters } from "@/components/admin/admin-finance-types";

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
  };
};

export function adminFinanceCoachesIntegratedFilterValues(
  values: Pick<CoachFinanceFilters, "month" | "payoutStatus" | "order">,
): Record<string, string> {
  return {
    month: values.month,
    payoutStatus: values.payoutStatus || "all",
    order: values.order,
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
      resolveChipLabel: (value) => `${labels.monthLabel}: ${value}`,
      render: ({ value, onChange }) => (
        <input
          type="month"
          className="ommm-input h-10 w-full"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={labels.monthLabel}
        />
      ),
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
    case "payoutStatus":
      return { ...current, payoutStatus: value === "all" ? "" : value };
    case "order":
      return { ...current, order: value };
    default:
      return current;
  }
}
