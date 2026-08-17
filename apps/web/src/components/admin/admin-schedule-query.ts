import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { AdminScheduleClassType } from "@/components/admin/admin-schedule-management";
import {
  buildSchedulePackageFilterOptions,
  resolveScheduleSelectedClassTypeIds,
} from "@/components/admin/admin-schedule-package-filter-options";
import {
  defaultScheduleListFilters,
  parseScheduleListFilterStateFromSearch,
  parseScheduleStripDayFromSearch,
  scheduleFiltersToApiParams,
  type ScheduleListFilterState,
} from "@/components/admin/admin-schedule-url";
import { parseListPageParams } from "@/lib/list-pagination";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { localIsoDateFromValue, scheduleTodayIsoDate } from "@/lib/local-iso-date";
import {
  monthBoundsIso,
  yearMonthFromIsoDay,
} from "@/components/admin/admin-schedule-month-utils";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";

export const ADMIN_SCHEDULE_LIST_PAGE_KEYS = {
  pageKey: "schedulePage",
  pageSizeKey: "schedulePageSize",
} as const;

export type AdminScheduleListPayload = {
  items: AdminScheduleSession[];
  total: number;
  take: number;
  offset: number;
  /** All matching startsAt values for date-strip counts (independent of page). */
  dateStripStartsAt?: string[];
};

export function buildAdminScheduleListEndpoint(
  take: number,
  offset: number,
  filterState?: ScheduleListFilterState,
  packages?: readonly AdminPackageRow[],
  classTypes?: readonly AdminScheduleClassType[],
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (filterState && packages && classTypes) {
    const packageOptions = buildSchedulePackageFilterOptions(packages, classTypes);
    const validPackageIds = new Set(packageOptions.map((option) => option.id));
    const selectedPackageIds = filterState.filters.typeIds.filter((id) =>
      validPackageIds.has(id),
    );
    const classTypeIds = resolveScheduleSelectedClassTypeIds(
      selectedPackageIds,
      packageOptions,
    );
    for (const [key, value] of scheduleFiltersToApiParams(
      filterState.filters,
      filterState.quickFilters,
      classTypeIds,
      filterState.stripDay,
    )) {
      params.set(key, value);
    }
  }
  return `/classes/admin/sessions?${params.toString()}`;
}

export function parseAdminScheduleListPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, ADMIN_SCHEDULE_LIST_PAGE_KEYS);
}

/** Paginated list API (list + monthly month-list; excludes weekly board). */
export function isScheduleListView(view: string | undefined): boolean {
  return view === undefined || view === "list" || view === "monthly";
}

export { parseScheduleListFilterStateFromSearch, type ScheduleListFilterState };

/** Date-strip counts ignore the selected strip day (keep filter-panel from/to). */
export function buildScheduleDateStripFilterState(
  filterState: ScheduleListFilterState,
): ScheduleListFilterState {
  return {
    ...filterState,
    stripDay: null,
  };
}

/** Whole-month list window: clears strip day and sets from/to to month bounds. */
export function applyMonthlyScheduleFilterState(
  state: ScheduleListFilterState,
  yearMonth?: string,
): ScheduleListFilterState {
  const month =
    yearMonth ??
    (state.filters.from.length > 0
      ? yearMonthFromIsoDay(state.filters.from)
      : yearMonthFromIsoDay(scheduleTodayIsoDate()));
  const { from, to } = monthBoundsIso(month);
  return {
    ...state,
    stripDay: null,
    filters: {
      ...state.filters,
      from,
      to,
    },
  };
}

/**
 * Resolves list filters for the schedule page, including monthly whole-month defaults.
 */
export function resolveAdminSchedulePageFilterState(
  search: Record<string, string | undefined>,
  view: ScheduleView,
): ScheduleListFilterState {
  const base = resolveAdminScheduleInitialFilterState(search);
  if (view !== "monthly") {
    return base;
  }
  const hasMonthRange =
    base.stripDay === null &&
    base.filters.from.length > 0 &&
    base.filters.to.length > 0 &&
    yearMonthFromIsoDay(base.filters.from) === yearMonthFromIsoDay(base.filters.to);
  if (hasMonthRange) {
    return base;
  }
  return applyMonthlyScheduleFilterState(base);
}

/**
 * Admin schedule defaults to today's strip day (not filter from/to chips).
 * Legacy URLs that encoded the strip as matching schedFrom/schedTo are migrated.
 */
export function resolveAdminScheduleInitialFilterState(
  search: Record<string, string | undefined>,
): ScheduleListFilterState {
  const parsed = parseScheduleListFilterStateFromSearch(search);
  const { hasExplicitStripDay } = parseScheduleStripDayFromSearch(search);

  if (hasExplicitStripDay) {
    return parsed;
  }

  const today = scheduleTodayIsoDate();
  const legacyStripDay =
    parsed.filters.from.length > 0 && parsed.filters.from === parsed.filters.to
      ? parsed.filters.from
      : null;

  if (legacyStripDay !== null) {
    return {
      ...parsed,
      stripDay: legacyStripDay,
      filters: {
        ...parsed.filters,
        from: "",
        to: "",
      },
    };
  }

  return {
    ...parsed,
    stripDay: today,
  };
}

/** Default list window for manager staff schedule when URL has no date range. */
export function resolveManagerScheduleInitialFilterState(
  search: Record<string, string | undefined>,
): ScheduleListFilterState {
  const parsed = parseScheduleListFilterStateFromSearch(search);
  if (parsed.filters.from.length > 0 && parsed.filters.to.length > 0) {
    return parsed;
  }
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  return {
    ...parsed,
    filters: {
      ...defaultScheduleListFilters,
      ...parsed.filters,
      from: parsed.filters.from || localIsoDateFromValue(from),
      to: parsed.filters.to || localIsoDateFromValue(to),
    },
  };
}
