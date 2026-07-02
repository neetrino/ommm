"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ADMIN_CLIENTS_EMPTY_FILTERS } from "@/components/admin/admin-clients-management.constants";
import {
  adminClientsFilterValuesFromState,
} from "@/components/admin/admin-clients-filter-fields";
import {
  ADMIN_CLIENTS_FILTER_KEYS,
  areUrlSearchQueriesEqual,
  mergeAdminClientsUrlQuery,
  VIEW_CLIENT_QUERY_KEY,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";
import { apiFetch } from "@/lib/api";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";

const filterKeys = ADMIN_CLIENTS_FILTER_KEYS;

type UseAdminClientsManagementArgs = {
  initial: AdminClientsPayload;
  initialFilters: Record<string, string>;
  onRegisterRefetch?: (refetch: () => void) => void;
};

export function useAdminClientsManagement({
  initial,
  initialFilters,
  onRegisterRefetch,
}: UseAdminClientsManagementArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStringRef = useRef(searchParams.toString());
  const hasMounted = useRef(false);
  const requestId = useRef(0);
  const [payload, setPayload] = useState(initial);
  const [filters, setFilters] = useState(() => ({
    search: initialFilters.search ?? "",
    tag: initialFilters.tag ?? "",
    status: initialFilters.status ?? "",
    classLevel: initialFilters.classLevel ?? "",
    paymentStatus: initialFilters.paymentStatus ?? "",
    source: initialFilters.source ?? "",
    preferredCoachId: initialFilters.preferredCoachId ?? "",
    attendance: initialFilters.attendance ?? "",
    birthdayMonth: initialFilters.birthdayMonth ?? "",
    order: initialFilters.order ?? "newest",
    quick: initialFilters.quick ?? "",
  }));
  const [fetchedClient, setFetchedClient] = useState<ClientRow | null>(null);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const viewClientId = searchParams.get(VIEW_CLIENT_QUERY_KEY);
  const [visibleClientId, setVisibleClientId] = useState<string | null>(viewClientId);
  const [prevViewClientId, setPrevViewClientId] = useState(viewClientId);
  if (viewClientId !== prevViewClientId) {
    setPrevViewClientId(viewClientId);
    setVisibleClientId(viewClientId);
  }

  useEffect(() => {
    searchParamsStringRef.current = searchParams.toString();
  }, [searchParams]);

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParamsStringRef.current);
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const selected = useMemo(() => {
    if (visibleClientId === null) {
      return null;
    }
    const fromRows = payload.rows.find((row) => row.id === visibleClientId);
    if (fromRows) {
      return fromRows;
    }
    if (fetchedClient?.id === visibleClientId) {
      return fetchedClient;
    }
    return null;
  }, [fetchedClient, payload.rows, visibleClientId]);

  const selectClient = useCallback(
    (row: ClientRow) => {
      setVisibleClientId(row.id);
      replaceSearchParams((params) => {
        params.set(VIEW_CLIENT_QUERY_KEY, row.id);
      });
    },
    [replaceSearchParams],
  );

  const closeClientView = useCallback(() => {
    setVisibleClientId(null);
    replaceSearchParams((params) => {
      params.delete(VIEW_CLIENT_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const restoredViewClientIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!viewClientId) {
      restoredViewClientIdRef.current = null;
      return undefined;
    }

    const fromRows = payload.rows.find((row) => row.id === viewClientId);
    if (fromRows) {
      restoredViewClientIdRef.current = viewClientId;
      return undefined;
    }

    if (restoredViewClientIdRef.current === viewClientId) {
      return undefined;
    }

    restoredViewClientIdRef.current = viewClientId;
    let cancelled = false;

    void apiFetch<{ activity: ClientRow }>(`/clients/${viewClientId}`)
      .then((detail) => {
        if (!cancelled) {
          setFetchedClient(detail.activity);
        }
      })
      .catch(() => {
        if (!cancelled) {
          restoredViewClientIdRef.current = null;
          replaceSearchParams((params) => {
            params.delete(VIEW_CLIENT_QUERY_KEY);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload.rows, replaceSearchParams, viewClientId]);

  const urlQueryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of filterKeys) {
      const value = filters[key].trim();
      if (value !== "" && !(key === "order" && value === "newest")) {
        params.set(key, value);
      }
    }
    return params.toString();
  }, [filters]);

  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams(urlQueryString);
    params.set("meta", "true");
    params.set("take", String(listPage.take));
    params.set("offset", String(listPage.offset));
    return params.toString();
  }, [listPage.offset, listPage.take, urlQueryString]);

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const nextRequestId = requestId.current + 1;
      requestId.current = nextRequestId;
      startTransition(() => {
        void apiFetch<AdminClientsPayload>(`/clients?${apiQueryString}`)
          .then((next) => {
            if (requestId.current !== nextRequestId) return;
            setPayload(next);
            setError(null);
          })
          .catch(() => {
            if (requestId.current === nextRequestId) {
              setError("Could not load matching clients.");
            }
          });
      });
      const currentQuery = searchParamsStringRef.current;
      const nextQuery = mergeAdminClientsUrlQuery(
        urlQueryString,
        Object.fromEntries(new URLSearchParams(currentQuery)),
      );
      if (!areUrlSearchQueriesEqual(currentQuery, nextQuery)) {
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [apiQueryString, listPage.offset, listPage.page, pathname, router, urlQueryString]);

  const handleClientChanged = useCallback(() => {
    router.refresh();
  }, [router]);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    replaceSearchParams((params) => {
      resetListPageQuery(params);
    });
  }

  const refetchClients = useCallback((): void => {
    startTransition(() => {
      void apiFetch<AdminClientsPayload>(`/clients?${apiQueryString}`)
        .then((next) => {
          setPayload(next);
          setError(null);
        })
        .catch(() => {
          setError("Could not load matching clients.");
        });
    });
  }, [apiQueryString]);

  useEffect(() => {
    onRegisterRefetch?.(refetchClients);
  }, [onRegisterRefetch, refetchClients]);

  function resetFilters() {
    setFilters(ADMIN_CLIENTS_EMPTY_FILTERS);
    replaceSearchParams((params) => {
      resetListPageQuery(params);
    });
  }

  const integratedFilterValues = useMemo(
    () => adminClientsFilterValuesFromState(filters),
    [filters],
  );

  function handleIntegratedFilterChange(key: string, value: string) {
    updateFilter(key as keyof typeof filters, value);
  }

  return {
    payload,
    filters,
    loading,
    error,
    selected,
    listPage,
    integratedFilterValues,
    selectClient,
    closeClientView,
    setListPage,
    updateFilter,
    refetchClients,
    resetFilters,
    handleIntegratedFilterChange,
    handleClientChanged,
  };
}
