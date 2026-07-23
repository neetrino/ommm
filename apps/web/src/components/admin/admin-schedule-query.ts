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
  scheduleFiltersToApiParams,
  type ScheduleListFilterState,
} from "@/components/admin/admin-schedule-url";
import { parseListPageParams } from "@/lib/list-pagination";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { localIsoDateFromValue } from "@/lib/local-iso-date";

export const ADMIN_SCHEDULE_LIST_PAGE_KEYS = {
  pageKey: "schedulePage",
  pageSizeKey: "schedulePageSize",
} as const;

export type AdminScheduleListPayload = {
  items: AdminScheduleSession[];
  total: number;
  take: number;
  offset: number;
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

export function isScheduleListView(view: string | undefined): boolean {
  return view === undefined || view === "list";
}

export { parseScheduleListFilterStateFromSearch, type ScheduleListFilterState };

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
