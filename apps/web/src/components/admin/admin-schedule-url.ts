import {
  parseAdminScheduleListFilter,
  serializeAdminScheduleListFilter,
  type ScheduleFiltersState,
} from "@/components/admin/admin-schedule-filter-fields";
import type { ScheduleQuickFilter } from "@/components/admin/admin-schedule-quick-filters";

export const ADMIN_SCHEDULE_LIST_FILTER_KEYS = [
  "schedQ",
  "schedFrom",
  "schedTo",
  "schedCoachIds",
  "schedTypeIds",
  "schedLevels",
  "schedStatuses",
  "schedAvailability",
  "schedTimeOfDay",
  "schedQuick",
] as const;

type SessionStatus = ScheduleFiltersState["statuses"][number];
type AvailabilityOption = ScheduleFiltersState["availability"][number];
type TimeOfDayOption = ScheduleFiltersState["timeOfDay"][number];

export type ScheduleListFilters = ScheduleFiltersState & {
  q: string;
};

export type ScheduleListFilterState = {
  filters: ScheduleListFilters;
  quickFilters: ScheduleQuickFilter[];
};

export const defaultScheduleListFilters: ScheduleListFilters = {
  q: "",
  from: "",
  to: "",
  coachIds: [],
  typeIds: [],
  levels: [],
  statuses: [],
  availability: [],
  timeOfDay: [],
};

const SESSION_STATUSES: readonly SessionStatus[] = ["DRAFT", "ACTIVE", "FULL", "CANCELLED"];
const AVAILABILITY_OPTIONS: readonly AvailabilityOption[] = ["available", "full"];
const TIME_OF_DAY_OPTIONS: readonly TimeOfDayOption[] = ["morning", "afternoon", "evening"];

function parseStatuses(values: string[]): SessionStatus[] {
  return values.filter((value): value is SessionStatus =>
    SESSION_STATUSES.includes(value as SessionStatus),
  );
}

function parseAvailability(values: string[]): AvailabilityOption[] {
  return values.filter((value): value is AvailabilityOption =>
    AVAILABILITY_OPTIONS.includes(value as AvailabilityOption),
  );
}

function parseTimeOfDay(values: string[]): TimeOfDayOption[] {
  return values.filter((value): value is TimeOfDayOption =>
    TIME_OF_DAY_OPTIONS.includes(value as TimeOfDayOption),
  );
}

function parseQuickFilters(values: string[]): ScheduleQuickFilter[] {
  const allowed: ScheduleQuickFilter[] = [
    "today",
    "thisWeek",
    "available",
    "full",
    "cancelled",
    "beginner",
    "evening",
  ];
  return values.filter((value): value is ScheduleQuickFilter =>
    allowed.includes(value as ScheduleQuickFilter),
  );
}

export function parseScheduleListFilterStateFromSearch(
  search: Record<string, string | undefined>,
): ScheduleListFilterState {
  const filters: ScheduleListFilters = {
    q: search.schedQ?.trim() ?? "",
    from: search.schedFrom ?? "",
    to: search.schedTo ?? "",
    coachIds: parseAdminScheduleListFilter(search.schedCoachIds ?? ""),
    typeIds: parseAdminScheduleListFilter(search.schedTypeIds ?? ""),
    levels: parseAdminScheduleListFilter(search.schedLevels ?? ""),
    statuses: parseStatuses(parseAdminScheduleListFilter(search.schedStatuses ?? "")),
    availability: parseAvailability(
      parseAdminScheduleListFilter(search.schedAvailability ?? ""),
    ),
    timeOfDay: parseTimeOfDay(parseAdminScheduleListFilter(search.schedTimeOfDay ?? "")),
  };
  return {
    filters,
    quickFilters: parseQuickFilters(parseAdminScheduleListFilter(search.schedQuick ?? "")),
  };
}

export function buildScheduleFiltersQuery(
  filters: ScheduleListFilters,
  quickFilters: readonly ScheduleQuickFilter[],
): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("schedQ", filters.q.trim());
  if (filters.from) params.set("schedFrom", filters.from);
  if (filters.to) params.set("schedTo", filters.to);
  const coachIds = serializeAdminScheduleListFilter(filters.coachIds);
  if (coachIds) params.set("schedCoachIds", coachIds);
  const typeIds = serializeAdminScheduleListFilter(filters.typeIds);
  if (typeIds) params.set("schedTypeIds", typeIds);
  const levels = serializeAdminScheduleListFilter(filters.levels);
  if (levels) params.set("schedLevels", levels);
  const statuses = serializeAdminScheduleListFilter(filters.statuses);
  if (statuses) params.set("schedStatuses", statuses);
  const availability = serializeAdminScheduleListFilter(filters.availability);
  if (availability) params.set("schedAvailability", availability);
  const timeOfDay = serializeAdminScheduleListFilter(filters.timeOfDay);
  if (timeOfDay) params.set("schedTimeOfDay", timeOfDay);
  const quick = serializeAdminScheduleListFilter(quickFilters);
  if (quick) params.set("schedQuick", quick);
  return params.toString();
}

export function scheduleFiltersToApiParams(
  filters: ScheduleListFilters,
  quickFilters: readonly ScheduleQuickFilter[],
  classTypeIds: readonly string[],
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const coachIds = serializeAdminScheduleListFilter(filters.coachIds);
  if (coachIds) params.set("coachIds", coachIds);
  if (classTypeIds.length > 0) {
    params.set("classTypeIds", classTypeIds.join(","));
  }
  const levels = serializeAdminScheduleListFilter(filters.levels);
  if (levels) params.set("levels", levels);
  const statuses = serializeAdminScheduleListFilter(filters.statuses);
  if (statuses) params.set("statuses", statuses);
  const availability = serializeAdminScheduleListFilter(filters.availability);
  if (availability) params.set("availability", availability);
  const timeOfDay = serializeAdminScheduleListFilter(filters.timeOfDay);
  if (timeOfDay) params.set("timeOfDay", timeOfDay);
  const quick = serializeAdminScheduleListFilter(quickFilters);
  if (quick) params.set("quick", quick);
  return params;
}
