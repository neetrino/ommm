"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { BookingsView } from "@/components/admin/admin-bookings-view";
import {
  buildAdminBookingsCalendarEndpoint,
  buildAdminBookingsListEndpoint,
  defaultAdminBookingsFilters,
  isCalendarBookingsView,
  resolveAdminBookingsCalendarRange,
  type AdminBookingsFilterState,
  type AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";
import { apiFetch } from "@/lib/api";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";

const SEARCH_DEBOUNCE_MS = 300;

type UseAdminBookingsListDataOptions = {
  initial: AdminBookingsManagementPayload;
  initialFilters: AdminBookingsFilterState;
  view: BookingsView;
};

export function useAdminBookingsListData({
  initial,
  initialFilters,
  view,
}: UseAdminBookingsListDataOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState(initial);
  const [calendarPayload, setCalendarPayload] = useState<AdminBookingsManagementPayload | null>(
    null,
  );
  const [filters, setFilters] = useState<AdminBookingsFilterState>(initialFilters);
  const [loadingList, startListTransition] = useTransition();
  const [loadingCalendar, startCalendarTransition] = useTransition();
  const listRequestId = useRef(0);
  const calendarRequestId = useRef(0);
  const listHasMounted = useRef(false);

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  useEffect(() => {
    setPayload(initial);
  }, [initial]);

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  const updateFilter = useCallback(
    <K extends keyof AdminBookingsFilterState>(key: K, value: AdminBookingsFilterState[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        const normalized = String(value).trim();
        if (normalized === "") {
          params.delete(key);
        } else {
          params.set(key, normalized);
        }
      });
    },
    [replaceSearchParams],
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultAdminBookingsFilters);
    replaceSearchParams((params) => {
      for (const key of [
        "search",
        "from",
        "to",
        "classTypeId",
        "coachId",
        "clientId",
        "status",
      ] as const) {
        params.delete(key);
      }
      resetListPageQuery(params);
    });
  }, [replaceSearchParams]);

  useEffect(() => {
    if (!listHasMounted.current) {
      listHasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const nextRequestId = listRequestId.current + 1;
      listRequestId.current = nextRequestId;
      startListTransition(() => {
        void apiFetch<AdminBookingsManagementPayload>(
          buildAdminBookingsListEndpoint(filters, listPage),
        )
          .then((next) => {
            if (listRequestId.current !== nextRequestId) return;
            setPayload(next);
          })
          .catch(() => {
            if (listRequestId.current === nextRequestId) {
              setPayload((current) => ({
                ...current,
                rows: [],
                pagination: {
                  total: 0,
                  take: listPage.take,
                  offset: listPage.offset,
                },
              }));
            }
          });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [filters, listPage.offset, listPage.take]);

  useEffect(() => {
    if (!isCalendarBookingsView(view)) {
      return undefined;
    }

    const range = resolveAdminBookingsCalendarRange();
    const nextRequestId = calendarRequestId.current + 1;
    calendarRequestId.current = nextRequestId;
    startCalendarTransition(() => {
      void apiFetch<AdminBookingsManagementPayload>(
        buildAdminBookingsCalendarEndpoint(filters, range),
      )
        .then((next) => {
          if (calendarRequestId.current !== nextRequestId) return;
          setCalendarPayload(next);
        })
        .catch(() => {
          if (calendarRequestId.current === nextRequestId) {
            setCalendarPayload(null);
          }
        });
    });
  }, [filters, view]);

  const calendarRows = isCalendarBookingsView(view)
    ? (calendarPayload?.rows ?? [])
    : payload.rows;
  const calendarSessions = isCalendarBookingsView(view)
    ? (calendarPayload?.sessionSlots ?? [])
    : payload.sessionSlots;

  return {
    payload,
    calendarRows,
    calendarSessions,
    filters,
    listPage,
    loading: loadingList || loadingCalendar,
    setListPage,
    updateFilter,
    resetFilters,
    setPayload,
  };
}
