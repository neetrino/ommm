import type { AnalyticsSectionId } from "@/components/admin/admin-analytics-module";
import {
  ANALYTICS_QUICK_FILTER_VALUES,
  parseAnalyticsQuickFilters,
  serializeAnalyticsQuickFilters,
} from "@/components/admin/admin-analytics-helpers";
import type {
  AnalyticsFilterValues,
  AnalyticsQuickFilterOption,
} from "@/components/admin/admin-analytics-types";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";

type AnalyticsFilterOptions = {
  classTypes: Array<{ id: string; name: string }>;
  coaches: Array<{ id: string; name: string }>;
};

type BuildAdminAnalyticsFilterFieldsArgs = {
  section: AnalyticsSectionId;
  filterOptions: AnalyticsFilterOptions;
  labels: {
    rangeLabel: string;
    range7: string;
    range30: string;
    range90: string;
    coachLabel: string;
    coachAll: string;
    classTypeLabel: string;
    classTypeAll: string;
    bookingStatusLabel: string;
    bookingStatusAll: string;
    bookingStatusBooked: string;
    bookingStatusCompleted: string;
    bookingStatusCancelled: string;
    bookingStatusMissed: string;
    sortLabel: string;
    sortRevenueDesc: string;
    sortRevenueAsc: string;
    sortBookingsDesc: string;
    sortBookingsAsc: string;
    sortAttendanceDesc: string;
    sortAttendanceAsc: string;
    sortNameAsc: string;
    quickFilterLabel: string;
    allQuickFilters: string;
    selectedCount: (count: number) => string;
    quickToday: string;
    quickWeek: string;
    quickMonth: string;
    quickLast30: string;
    quickTopCoaches: string;
    quickPopularClasses: string;
  };
};

const QUICK_FILTER_LABEL_KEYS: Record<AnalyticsQuickFilterOption, keyof BuildAdminAnalyticsFilterFieldsArgs["labels"]> = {
  today: "quickToday",
  week: "quickWeek",
  month: "quickMonth",
  last30: "quickLast30",
  topCoaches: "quickTopCoaches",
  popularClasses: "quickPopularClasses",
};

function resolveQuickChipLabel(
  label: string,
  allLabel: string,
  value: string,
  options: readonly { value: string; label: string }[],
): string {
  const selected = parseAnalyticsQuickFilters(value);
  if (selected.length === 0) {
    return `${label}: ${allLabel}`;
  }
  if (selected.length === 1) {
    const option = options.find((item) => item.value === selected[0]);
    return option ? `${label}: ${option.label}` : `${label}: 1`;
  }
  return `${label}: ${selected.length}`;
}

function resolveSortChipLabel(
  label: string,
  value: string,
  options: readonly { value: string; label: string }[],
): string {
  const option = options.find((item) => item.value === value);
  return `${label}: ${option?.label ?? value}`;
}

export function adminAnalyticsIntegratedFilterValues(
  values: AnalyticsFilterValues,
): Record<string, string> {
  return {
    rangeDays: String(values.rangeDays),
    coachId: values.coachId,
    classTypeId: values.classTypeId,
    bookingStatus: values.bookingStatus,
    sort: values.sort,
    quick: values.quick,
  };
}

export function buildAdminAnalyticsFilterFields({
  section,
  filterOptions,
  labels,
}: BuildAdminAnalyticsFilterFieldsArgs): AdminIntegratedFilterField[] {
  const quickFilterOptions = ANALYTICS_QUICK_FILTER_VALUES.map((value) => ({
    value,
    label: labels[QUICK_FILTER_LABEL_KEYS[value]] as string,
  }));

  const sortOptions = [
    { value: "revenue-desc", label: labels.sortRevenueDesc },
    { value: "revenue-asc", label: labels.sortRevenueAsc },
    { value: "bookings-desc", label: labels.sortBookingsDesc },
    { value: "bookings-asc", label: labels.sortBookingsAsc },
    { value: "attendance-desc", label: labels.sortAttendanceDesc },
    { value: "attendance-asc", label: labels.sortAttendanceAsc },
    { value: "name-asc", label: labels.sortNameAsc },
  ] as const;

  const fields: AdminIntegratedFilterField[] = [
    {
      key: "rangeDays",
      label: labels.rangeLabel,
      emptyValue: "30",
      alwaysShowChip: true,
      resolveChipLabel: (value) => {
        const rangeLabels: Record<string, string> = {
          "7": labels.range7,
          "30": labels.range30,
          "90": labels.range90,
        };
        return `${labels.rangeLabel}: ${rangeLabels[value] ?? value}`;
      },
      options: [
        { value: "7", label: labels.range7 },
        { value: "30", label: labels.range30 },
        { value: "90", label: labels.range90 },
      ],
    },
  ];

  if (section === "bookings" || section === "coaches") {
    fields.push({
      key: "coachId",
      label: labels.coachLabel,
      emptyValue: "",
      allLabel: labels.coachAll,
      options: filterOptions.coaches.map((coach) => ({
        value: coach.id,
        label: coach.name,
      })),
    });
  }

  if (section === "bookings") {
    fields.push(
      {
        key: "classTypeId",
        label: labels.classTypeLabel,
        emptyValue: "",
        allLabel: labels.classTypeAll,
        options: filterOptions.classTypes.map((classType) => ({
          value: classType.id,
          label: classType.name,
        })),
      },
      {
        key: "bookingStatus",
        label: labels.bookingStatusLabel,
        emptyValue: "",
        allLabel: labels.bookingStatusAll,
        options: [
          { value: "BOOKED", label: labels.bookingStatusBooked },
          { value: "COMPLETED", label: labels.bookingStatusCompleted },
          { value: "CANCELLED", label: labels.bookingStatusCancelled },
          { value: "MISSED", label: labels.bookingStatusMissed },
        ],
      },
    );
  }

  fields.push(
    {
      key: "quick",
      label: labels.quickFilterLabel,
      fieldType: "custom",
      emptyValue: "",
      alwaysShowChip: true,
      resolveChipLabel: (value) =>
        resolveQuickChipLabel(
          labels.quickFilterLabel,
          labels.allQuickFilters,
          value,
          quickFilterOptions,
        ),
      render: ({ value, onChange }) => (
        <OmmFilterMultiSelect
          variant="accent"
          wrapLabel
          ariaLabel={labels.quickFilterLabel}
          allLabel={labels.allQuickFilters}
          selectedValues={parseAnalyticsQuickFilters(value)}
          onChange={(selectedValues) =>
            onChange(
              serializeAnalyticsQuickFilters(selectedValues as AnalyticsQuickFilterOption[]),
            )
          }
          formatSelectedCount={labels.selectedCount}
          options={quickFilterOptions}
        />
      ),
    },
    {
      key: "sort",
      label: labels.sortLabel,
      emptyValue: "revenue-desc",
      alwaysShowChip: true,
      resolveChipLabel: (value) => resolveSortChipLabel(labels.sortLabel, value, sortOptions),
      options: [...sortOptions],
    },
  );

  return fields;
}
