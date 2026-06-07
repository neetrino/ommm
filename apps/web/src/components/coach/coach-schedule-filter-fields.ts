import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import type {
  ScheduleSessionListRow,
  ScheduleSessionListStatus,
} from "@/components/shared/schedule/schedule-session-list-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";
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
  const startsAt = new Date(row.startsAt);

  if (filters.from && startsAt < new Date(`${filters.from}T00:00:00`)) {
    return false;
  }
  if (filters.to && startsAt > new Date(`${filters.to}T23:59:59`)) {
    return false;
  }
  if (filters.classType !== "all" && row.classType.name !== filters.classType) {
    return false;
  }
  if (filters.status !== "all" && row.status !== filters.status) {
    return false;
  }

  const search = filters.search.trim().toLowerCase();
  if (search.length === 0) {
    return true;
  }

  const haystack = `${row.title} ${row.classType.name}`.toLowerCase();
  return haystack.includes(search);
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
