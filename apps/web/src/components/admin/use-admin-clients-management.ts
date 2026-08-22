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
  areUrlSearchQueriesEqual,
  buildAdminClientsFilterQuery,
  mergeAdminClientsUrlQuery,
  parseAdminClientsListPageParams,
  readBrowserSearchQuery,
  replaceAdminClientsSearchParams,
  VIEW_CLIENT_QUERY_KEY,
} from "@/components/admin/admin-clients-query";
import {
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  CLIENT_PROFILE_TAB_QUERY_KEY,
} from "@/components/admin/admin-client-sheet-tabs";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";
import { apiFetch } from "@/lib/api";
import {
  isOutOfRangeEmptyPage,
  listPageParamsForFetch,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";

type UseAdminClientsManagementArgs = {
  initial: AdminClientsPayload;
  initialFilters: Record<string, string>;
  onRegisterRefetch?: (refetch: () => void) => void;
  onRegisterSeedCreatedClient?: (seed: (client: ClientRow) => void) => void;
};

export function useAdminClientsManagement({
  initial,
  initialFilters,
  onRegisterRefetch,
  onRegisterSeedCreatedClient,
}: UseAdminClientsManagementArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const requestId = useRef(0);
  const [payload, setPayload] = useState(initial);
  const [filters, setFilters] = useState(() => ({
    search: initialFilters.search ?? "",
    tag: initialFilters.tag ?? "",
    status: initialFilters.status ?? "",
    package: initialFilters.package ?? "",
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
  const [isListFetching, setIsListFetching] = useState(false);
  const viewClientId = searchParams.get(VIEW_CLIENT_QUERY_KEY);
  const [visibleClientId, setVisibleClientId] = useState<string | null>(viewClientId);
  const [prevViewClientId, setPrevViewClientId] = useState(viewClientId);
  if (viewClientId !== prevViewClientId) {
    setPrevViewClientId(viewClientId);
    setVisibleClientId(viewClientId);
  }

  const listPage = useMemo(
    () => parseAdminClientsListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      replaceAdminClientsSearchParams(pathname, router, mutator);
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
      setFetchedClient(row);
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
      params.delete(CLIENT_PROFILE_TAB_QUERY_KEY);
      params.delete(CLIENT_ADD_PACKAGE_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const restoredViewClientIdRef = useRef<string | null>(null);

  /** Opens the detail sheet for a just-created client (URL may already include viewClient). */
  const seedCreatedClient = useCallback((client: ClientRow) => {
    setFetchedClient(client);
    setVisibleClientId(client.id);
    restoredViewClientIdRef.current = client.id;
  }, []);

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
            params.delete(CLIENT_PROFILE_TAB_QUERY_KEY);
            params.delete(CLIENT_ADD_PACKAGE_QUERY_KEY);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload.rows, replaceSearchParams, viewClientId]);

  const urlQueryString = useMemo(
    () => buildAdminClientsFilterQuery(filters),
    [filters],
  );

  const urlFilterQuery = useMemo(
    () => buildAdminClientsFilterQuery(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const listPageForFetch = useMemo(
    () => listPageParamsForFetch(listPage, urlQueryString !== urlFilterQuery),
    [listPage, urlFilterQuery, urlQueryString],
  );

  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams(urlQueryString);
    params.set("meta", "true");
    params.set("take", String(listPageForFetch.take));
    params.set("offset", String(listPageForFetch.offset));
    return params.toString();
  }, [listPageForFetch.offset, listPageForFetch.take, urlQueryString]);

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const currentQuery = readBrowserSearchQuery();
      const nextQuery = mergeAdminClientsUrlQuery(urlQueryString, currentQuery);
      if (!areUrlSearchQueriesEqual(currentQuery, nextQuery)) {
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [pathname, router, urlQueryString]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const nextRequestId = requestId.current + 1;
      requestId.current = nextRequestId;
      setIsListFetching(true);
      void apiFetch<AdminClientsPayload>(`/clients?${apiQueryString}`)
        .then((next) => {
          if (requestId.current !== nextRequestId) return;
          if (
            isOutOfRangeEmptyPage({
              rowCount: next.rows.length,
              total: next.pagination.total,
              offset: next.pagination.offset,
            })
          ) {
            setListPage(1);
            return;
          }
          setPayload(next);
          setError(null);
        })
        .catch(() => {
          if (requestId.current === nextRequestId) {
            setError("Could not load matching clients.");
          }
        })
        .finally(() => {
          if (requestId.current === nextRequestId) {
            setIsListFetching(false);
          }
        });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [apiQueryString, setListPage]);

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

  const handleClientChanged = useCallback(() => {
    refetchClients();
    router.refresh();
  }, [refetchClients, router]);

  useEffect(() => {
    onRegisterRefetch?.(refetchClients);
  }, [onRegisterRefetch, refetchClients]);

  useEffect(() => {
    onRegisterSeedCreatedClient?.(seedCreatedClient);
  }, [onRegisterSeedCreatedClient, seedCreatedClient]);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    replaceSearchParams((params) => {
      resetListPageQuery(params);
    });
  }

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
    loading: loading || isListFetching,
    error,
    selected,
    listPage,
    integratedFilterValues,
    selectClient,
    seedCreatedClient,
    closeClientView,
    setListPage,
    updateFilter,
    refetchClients,
    resetFilters,
    handleIntegratedFilterChange,
    handleClientChanged,
  };
}
