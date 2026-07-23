import {
  parseAdminScheduleListFilter,
  serializeAdminScheduleListFilter,
  type ScheduleFiltersState,
} from "@/components/admin/admin-schedule-filter-fields";
import type { ScheduleQuickFilter } from "@/components/admin/admin-schedule-quick-filters";
import { parseSessionSortOrder, type SessionSortOrder } from "@/lib/list-sort";

export const ADMIN_SCHEDULE_LIST_FILTER_KEYS = [
  "schedQ",
  "schedFrom",
  "schedTo",
  "schedDay",
  "schedStrip",
  "schedCoachIds",
  "schedTypeIds",
  "schedLevels",
  "schedStatuses",
  "schedAvailability",
  "schedTimeOfDay",
  "schedQuick",
  "schedOrder",
] as const;

/** URL value for date-strip "All classes". */
export const SCHEDULE_STRIP_ALL_VALUE = "all";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type SessionStatus = ScheduleFiltersState["statuses"][number];
type AvailabilityOption = ScheduleFiltersState["availability"][number];
type TimeOfDayOption = ScheduleFiltersState["timeOfDay"][number];

export type ScheduleListFilters = ScheduleFiltersState & {
  q: string;
  order: SessionSortOrder;
};

export type ScheduleListFilterState = {
  filters: ScheduleListFilters;
  quickFilters: ScheduleQuickFilter[];
  /**
   * Date-strip selection, independent of filter-panel from/to chips.
   * `null` = All classes; ISO day = that calendar day.
   */
  stripDay: string | null;
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
  order: "upcoming",
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

function isIsoCalendarDay(value: string): boolean {
  return ISO_DATE_PATTERN.test(value);
}

/**
 * Parses strip-day URL state.
 * Supports `schedDay` and legacy `schedStrip=all`.
 */
export function parseScheduleStripDayFromSearch(
  search: Record<string, string | undefined>,
): { stripDay: string | null; hasExplicitStripDay: boolean } {
  const raw = search.schedDay?.trim();
  if (raw === SCHEDULE_STRIP_ALL_VALUE || search.schedStrip === SCHEDULE_STRIP_ALL_VALUE) {
    return { stripDay: null, hasExplicitStripDay: true };
  }
  if (raw !== undefined && raw.length > 0 && isIsoCalendarDay(raw)) {
    return { stripDay: raw, hasExplicitStripDay: true };
  }
  return { stripDay: null, hasExplicitStripDay: false };
}

export function parseScheduleListFilterStateFromSearch(
  search: Record<string, string | undefined>,
): ScheduleListFilterState {
  const { stripDay, hasExplicitStripDay } = parseScheduleStripDayFromSearch(search);
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
    order: parseSessionSortOrder(search.schedOrder),
  };
  return {
    filters,
    quickFilters: parseQuickFilters(parseAdminScheduleListFilter(search.schedQuick ?? "")),
    // Unresolved default is applied in resolveAdminScheduleInitialFilterState.
    stripDay: hasExplicitStripDay ? stripDay : null,
  };
}

export function buildScheduleFiltersQuery(
  filters: ScheduleListFilters,
  quickFilters: readonly ScheduleQuickFilter[],
  stripDay: string | null,
): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("schedQ", filters.q.trim());
  if (filters.from) params.set("schedFrom", filters.from);
  if (filters.to) params.set("schedTo", filters.to);
  if (stripDay === null) {
    params.set("schedDay", SCHEDULE_STRIP_ALL_VALUE);
  } else {
    params.set("schedDay", stripDay);
  }
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
  if (filters.order !== "upcoming") {
    params.set("schedOrder", filters.order);
  }
  return params.toString();
}

/** Effective list date range: strip day wins over filter-panel from/to. */
export function resolveScheduleListDateRange(
  filters: Pick<ScheduleListFilters, "from" | "to">,
  stripDay: string | null,
): { from: string; to: string } {
  if (stripDay !== null) {
    return { from: stripDay, to: stripDay };
  }
  return { from: filters.from, to: filters.to };
}

export function scheduleFiltersToApiParams(
  filters: ScheduleListFilters,
  quickFilters: readonly ScheduleQuickFilter[],
  classTypeIds: readonly string[],
  stripDay: string | null = null,
): URLSearchParams {
  const params = new URLSearchParams();
  const { from, to } = resolveScheduleListDateRange(filters, stripDay);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (from) params.set("from", from);
  if (to) params.set("to", to);
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
  if (filters.order !== "upcoming") {
    params.set("order", filters.order);
  }
  return params;
}
