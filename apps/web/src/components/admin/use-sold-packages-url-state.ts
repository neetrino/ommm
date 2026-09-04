"use client";

import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  PACKAGES_SOLD_LIST_PAGE_SIZE,
  PACKAGES_SOLD_PLAN_ALL,
  PACKAGES_SOLD_PLAN_QUERY_KEY,
  PACKAGES_SOLD_SEARCH_DEBOUNCE_MS,
  PACKAGES_SOLD_SEARCH_QUERY_KEY,
} from "@/components/admin/admin-packages-sold";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

export function useSoldPackagesUrlState(initialQuery: string, initialPlanId: string) {
  const [search, setSearch] = usePropSyncedState(initialQuery);
  const [planId, setPlanId] = usePropSyncedState(initialPlanId);
  const navigation = useSoldListNavigation(search, planId);
  useDebouncedSearchSync(search, navigation.syncFiltersToUrl);
  useImmediatePlanSync(planId, navigation.syncFiltersToUrl);

  return {
    search,
    setSearch,
    planId,
    setPlanId,
    listPage: navigation.listPage,
    setListPage: navigation.setListPage,
    isPending: navigation.isPending,
    router: navigation.router,
  };
}

function useSoldListNavigation(search: string, planId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchParamsRef = useRef(searchParams.toString());
  const searchRef = useRef(search);
  const planIdRef = useRef(planId);
  const listPage = useMemo(() => soldListPageFromSearch(searchParams), [searchParams]);

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
    searchRef.current = search;
    planIdRef.current = planId;
  }, [planId, search, searchParams]);

  const replaceQuery = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = nextSearchQuery(searchParamsRef.current, mutator);
      if (next === null) {
        return;
      }
      startTransition(() => {
        router.replace(next.length > 0 ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  const syncFiltersToUrl = useCallback(() => {
    replaceQuery((params) => {
      writeSoldFilterParams(params, searchRef.current, planIdRef.current);
      resetListPageQuery(params);
    });
  }, [replaceQuery]);

  const setListPage = useCallback(
    (page: number) => {
      replaceQuery((params) => {
        syncListPageQuery(params, page);
      });
    },
    [replaceQuery],
  );

  return { listPage, setListPage, isPending, router, syncFiltersToUrl };
}

function writeSoldFilterParams(params: URLSearchParams, search: string, planId: string): void {
  const trimmed = search.trim();
  if (trimmed.length === 0) {
    params.delete(PACKAGES_SOLD_SEARCH_QUERY_KEY);
  } else {
    params.set(PACKAGES_SOLD_SEARCH_QUERY_KEY, trimmed);
  }
  if (planId.length === 0 || planId === PACKAGES_SOLD_PLAN_ALL) {
    params.delete(PACKAGES_SOLD_PLAN_QUERY_KEY);
  } else {
    params.set(PACKAGES_SOLD_PLAN_QUERY_KEY, planId);
  }
}

function soldListPageFromSearch(searchParams: URLSearchParams) {
  return parseListPageParams(Object.fromEntries(searchParams.entries()), {
    defaultPageSize: PACKAGES_SOLD_LIST_PAGE_SIZE,
  });
}

function nextSearchQuery(
  currentQuery: string,
  mutator: (params: URLSearchParams) => void,
): string | null {
  const params = new URLSearchParams(currentQuery);
  mutator(params);
  const qs = params.toString();
  return qs === currentQuery ? null : qs;
}

function useDebouncedSearchSync(search: string, syncFiltersToUrl: () => void): void {
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }
    const handle = window.setTimeout(syncFiltersToUrl, PACKAGES_SOLD_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [search, syncFiltersToUrl]);
}

function useImmediatePlanSync(planId: string, syncFiltersToUrl: () => void): void {
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    syncFiltersToUrl();
  }, [planId, syncFiltersToUrl]);
}
