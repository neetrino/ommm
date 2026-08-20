import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import type {
  ScheduleSessionListRow,
  ScheduleSessionListStatus,
} from "@/components/shared/schedule/schedule-session-list-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";
import { matchesStudioDateFilter } from "@/lib/filter-date-range";
import { matchesSearchTokens } from "@/lib/search-tokens";
import { buildSessionSortFilterField, type SessionSortOrder } from "@/lib/list-sort";

export type CoachScheduleStatusFilter = "all" | ScheduleSessionListStatus;

export type CoachScheduleFilterValues = {
  search: string;
  from: string;
  to: string;
  classType: string;
  status: CoachScheduleStatusFilter;
  order: SessionSortOrder;
};

export const DEFAULT_COACH_SCHEDULE_FILTER_VALUES: CoachScheduleFilterValues = {
  search: "",
  from: "",
  to: "",
  classType: "all",
  status: "all",
  order: "upcoming",
};

const STATUS_OPTIONS: readonly Exclude<CoachScheduleStatusFilter, "all">[] = [
  "ACTIVE",
  "FULL",
  "FINISHED",
  "CANCELLED",
  "DRAFT",
];

type BuildCoachScheduleFilterFieldsArgs = {
  classTypes: readonly string[];
  labels: {
    dateFrom: string;
    dateTo: string;
    classAll: string;
    status: string;
    statusAll: string;
    statusValues: Record<Exclude<CoachScheduleStatusFilter, "all">, string>;
    searchPlaceholder: string;
    resetFilters: string;
    sort: string;
    sortUpcoming: string;
    sortDateAsc: string;
    sortDateDesc: string;
  };
};

export function coachScheduleIntegratedFilterValues(
  values: Omit<CoachScheduleFilterValues, "search">,
): Record<string, string> {
  return {
    from: values.from,
    to: values.to,
    classType: values.classType,
    status: values.status,
    order: values.order,
  };
}

export function buildCoachScheduleFilterFields({
  classTypes,
  labels,
}: BuildCoachScheduleFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: "from",
      label: labels.dateFrom,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(labels.dateFrom, value),
    },
    {
      key: "to",
      label: labels.dateTo,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(labels.dateTo, value),
    },
    {
      key: "classType",
      label: "Class type",
      emptyValue: "all",
      allLabel: labels.classAll,
      options: classTypes.map((name) => ({ value: name, label: name })),
    },
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: STATUS_OPTIONS.map((status) => ({
        value: status,
        label: labels.statusValues[status],
      })),
    },
    buildSessionSortFilterField(labels.sort, {
      upcoming: labels.sortUpcoming,
      "date-asc": labels.sortDateAsc,
      "date-desc": labels.sortDateDesc,
    }),
  ];
}

export function extractCoachScheduleClassTypes(
  sessions: readonly ScheduleSessionListRow[],
): string[] {
  const names = new Set<string>();
  for (const session of sessions) {
    names.add(session.classType.name);
  }
  return Array.from(names).sort((left, right) => left.localeCompare(right));
}

export function matchesCoachScheduleFilters(
  row: ScheduleSessionListRow,
  filters: CoachScheduleFilterValues,
): boolean {
  if (!matchesStudioDateFilter(row.startsAt, filters.from, filters.to)) {
    return false;
  }
  if (filters.classType !== "all" && row.classType.name !== filters.classType) {
    return false;
  }
  if (filters.status !== "all" && row.status !== filters.status) {
    return false;
  }

  return matchesSearchTokens(`${row.title} ${row.classType.name}`, filters.search);
}

export function hasActiveCoachScheduleFilters(filters: CoachScheduleFilterValues): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.from.length > 0 ||
    filters.to.length > 0 ||
    filters.classType !== "all" ||
    filters.status !== "all" ||
    filters.order !== "upcoming"
  );
}
