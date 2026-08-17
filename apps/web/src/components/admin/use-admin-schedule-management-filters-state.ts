import { useCallback, useEffect, useRef } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SEARCH_DEBOUNCE_MS } from "@/components/admin/admin-schedule-management.constants";
import { ADMIN_SCHEDULE_LIST_PAGE_KEYS } from "@/components/admin/admin-schedule-query";
import type { ScheduleQuickFilter } from "@/components/admin/admin-schedule-quick-filters";
import type { AdminScheduleFilters } from "@/components/admin/admin-schedule-session.types";
import {
  ADMIN_SCHEDULE_LIST_FILTER_KEYS,
  buildScheduleFiltersQuery,
  defaultScheduleListFilters,
  type ScheduleListFilterState,
} from "@/components/admin/admin-schedule-url";
import { resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";
import { LIST_BOARD_VIEW_QUERY_KEY } from "@/lib/list-board-view";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";

type UseAdminScheduleManagementFiltersStateParams = {
  initialFilterState: ScheduleListFilterState;
  listPagination: { total: number; take: number; offset: number } | null;
  pathname: string;
  router: AppRouterInstance;
  searchParams: URLSearchParams;
  searchDraft: string;
  setSearchDraft: (value: string) => void;
  filters: AdminScheduleFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdminScheduleFilters>>;
  quickFilters: ScheduleQuickFilter[];
  setQuickFilters: React.Dispatch<React.SetStateAction<ScheduleQuickFilter[]>>;
  stripDay: string | null;
  setStripDay: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useAdminScheduleManagementFiltersState({
  initialFilterState,
  listPagination,
  pathname,
  router,
  searchParams,
  searchDraft,
  setSearchDraft,
  filters,
  setFilters,
  quickFilters,
  setQuickFilters,
  stripDay,
  setStripDay,
}: UseAdminScheduleManagementFiltersStateParams) {
  const hasMounted = useRef(false);
  const filterStateRef = useRef(initialFilterState);

  useEffect(() => {
    filterStateRef.current = { filters, quickFilters, stripDay };
  }, [filters, quickFilters, stripDay]);

  const syncFilterStateToUrl = useCallback(
    (state: ScheduleListFilterState, resetPage = false, viewOverride?: ScheduleView) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of ADMIN_SCHEDULE_LIST_FILTER_KEYS) {
        params.delete(key);
      }
      if (resetPage && listPagination !== null) {
        resetListPageQuery(params, ADMIN_SCHEDULE_LIST_PAGE_KEYS);
      }
      const filterQuery = buildScheduleFiltersQuery(
        state.filters,
        state.quickFilters,
        state.stripDay,
      );
      if (filterQuery.length > 0) {
        for (const [key, value] of new URLSearchParams(filterQuery)) {
          params.set(key, value);
        }
      }
      if (viewOverride !== undefined) {
        params.set(LIST_BOARD_VIEW_QUERY_KEY, viewOverride);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [listPagination, pathname, router, searchParams],
  );

  const patchFilterState = useCallback(
    (
      patch: {
        filters?: Partial<AdminScheduleFilters>;
        quickFilters?: ScheduleQuickFilter[];
        stripDay?: string | null;
      },
      resetPage = true,
      viewOverride?: ScheduleView,
    ) => {
      const next: ScheduleListFilterState = {
        filters: { ...filterStateRef.current.filters, ...patch.filters },
        quickFilters: patch.quickFilters ?? filterStateRef.current.quickFilters,
        stripDay: patch.stripDay !== undefined ? patch.stripDay : filterStateRef.current.stripDay,
      };
      setFilters(next.filters);
      setQuickFilters(next.quickFilters);
      setStripDay(next.stripDay);
      filterStateRef.current = next;
      syncFilterStateToUrl(next, resetPage, viewOverride);
    },
    [setFilters, setQuickFilters, setStripDay, syncFilterStateToUrl],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      if (filterStateRef.current.filters.q === trimmed) {
        return;
      }
      patchFilterState({ filters: { q: trimmed } }, true);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [patchFilterState, searchDraft]);

  const resetFilters = useCallback(() => {
    const cleared: ScheduleListFilterState = {
      filters: defaultScheduleListFilters,
      quickFilters: [],
      stripDay: scheduleTodayIsoDate(),
    };
    setSearchDraft("");
    setFilters(cleared.filters);
    setQuickFilters(cleared.quickFilters);
    setStripDay(cleared.stripDay);
    filterStateRef.current = cleared;
    syncFilterStateToUrl(cleared, true);
  }, [setFilters, setQuickFilters, setStripDay, setSearchDraft, syncFilterStateToUrl]);

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize, ADMIN_SCHEDULE_LIST_PAGE_KEYS);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    patchFilterState,
    resetFilters,
    setListPage,
  };
}
