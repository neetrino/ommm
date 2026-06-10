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
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { apiFetch } from "@/lib/api";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
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
  const [payload, setPayload] = usePropSyncedState(initial);
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
        "status",
        "paymentStatus",
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
  }, [filters, listPage, setPayload]);

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

  const reloadList = useCallback(() => {
    const nextListRequestId = listRequestId.current + 1;
    listRequestId.current = nextListRequestId;
    startListTransition(() => {
      void apiFetch<AdminBookingsManagementPayload>(
        buildAdminBookingsListEndpoint(filters, listPage),
      )
        .then((next) => {
          if (listRequestId.current !== nextListRequestId) return;
          setPayload(next);
        })
        .catch(() => {
          if (listRequestId.current === nextListRequestId) {
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

    if (!isCalendarBookingsView(view)) {
      return;
    }

    const range = resolveAdminBookingsCalendarRange();
    const nextCalendarRequestId = calendarRequestId.current + 1;
    calendarRequestId.current = nextCalendarRequestId;
    startCalendarTransition(() => {
      void apiFetch<AdminBookingsManagementPayload>(
        buildAdminBookingsCalendarEndpoint(filters, range),
      )
        .then((next) => {
          if (calendarRequestId.current !== nextCalendarRequestId) return;
          setCalendarPayload(next);
        })
        .catch(() => {
          if (calendarRequestId.current === nextCalendarRequestId) {
            setCalendarPayload(null);
          }
        });
    });
  }, [filters, listPage, setPayload, view]);

  useRealtimeRefetch(REALTIME_REFETCH_KEYS.BOOKINGS_ADMIN, reloadList);
  useRealtimeRefetch(REALTIME_REFETCH_KEYS.WAITLIST_ADMIN, reloadList);

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
