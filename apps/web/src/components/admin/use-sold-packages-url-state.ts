"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useTransition,
  type MutableRefObject,
  type TransitionStartFunction,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  PACKAGES_SOLD_CATEGORY_ALL,
  PACKAGES_SOLD_CATEGORY_QUERY_KEY,
  PACKAGES_SOLD_LIST_PAGE_SIZE,
  PACKAGES_SOLD_PLAN_ALL,
  PACKAGES_SOLD_PLAN_QUERY_KEY,
  PACKAGES_SOLD_SEARCH_DEBOUNCE_MS,
  PACKAGES_SOLD_SEARCH_QUERY_KEY,
} from "@/components/admin/admin-packages-sold";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

export function useSoldPackagesUrlState(
  initialQuery: string,
  initialPlanId: string,
  initialCategorySlug: string,
) {
  const [search, setSearch] = usePropSyncedState(initialQuery);
  const [planId, setPlanId] = usePropSyncedState(initialPlanId);
  const [categorySlug, setCategorySlug] = usePropSyncedState(initialCategorySlug);
  const navigation = useSoldListNavigation(search, planId, categorySlug);
  useDebouncedSearchSync(search, navigation.syncFiltersToUrl);
  useImmediateSelectFilterSync(planId, categorySlug, navigation.syncFiltersToUrl);

  return {
    search,
    setSearch,
    planId,
    setPlanId,
    categorySlug,
    setCategorySlug,
    listPage: navigation.listPage,
    setListPage: navigation.setListPage,
    isPending: navigation.isPending,
    router: navigation.router,
  };
}

function useSoldListNavigation(search: string, planId: string, categorySlug: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const queryRefs = useSoldQueryRefs(search, planId, categorySlug, searchParams);
  const listPage = useMemo(() => soldListPageFromSearch(searchParams), [searchParams]);
  const replaceQuery = useSoldQueryReplace(pathname, router, queryRefs.params, startTransition);

  const syncFiltersToUrl = useCallback(() => {
    replaceQuery((params) => {
      writeSoldFilterParams(
        params,
        queryRefs.search.current,
        queryRefs.planId.current,
        queryRefs.categorySlug.current,
      );
      resetListPageQuery(params);
    });
  }, [queryRefs.categorySlug, queryRefs.planId, queryRefs.search, replaceQuery]);

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

function useSoldQueryRefs(
  search: string,
  planId: string,
  categorySlug: string,
  searchParams: URLSearchParams,
) {
  const params = useRef(searchParams.toString());
  const searchRef = useRef(search);
  const planIdRef = useRef(planId);
  const categorySlugRef = useRef(categorySlug);
  useEffect(() => {
    params.current = searchParams.toString();
    searchRef.current = search;
    planIdRef.current = planId;
    categorySlugRef.current = categorySlug;
  }, [categorySlug, planId, search, searchParams]);
  return { params, search: searchRef, planId: planIdRef, categorySlug: categorySlugRef };
}

function useSoldQueryReplace(
  pathname: string,
  router: ReturnType<typeof useRouter>,
  searchParamsRef: MutableRefObject<string>,
  startTransition: TransitionStartFunction,
) {
  return useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = nextSearchQuery(searchParamsRef.current, mutator);
      if (next === null) {
        return;
      }
      startTransition(() => {
        router.replace(next.length > 0 ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParamsRef, startTransition],
  );
}

function writeSoldFilterParams(
  params: URLSearchParams,
  search: string,
  planId: string,
  categorySlug: string,
): void {
  writeOptionalQueryParam(params, PACKAGES_SOLD_SEARCH_QUERY_KEY, search.trim(), "");
  writeOptionalQueryParam(
    params,
    PACKAGES_SOLD_PLAN_QUERY_KEY,
    planId,
    PACKAGES_SOLD_PLAN_ALL,
  );
  writeOptionalQueryParam(
    params,
    PACKAGES_SOLD_CATEGORY_QUERY_KEY,
    categorySlug,
    PACKAGES_SOLD_CATEGORY_ALL,
  );
}

function writeOptionalQueryParam(
  params: URLSearchParams,
  key: string,
  value: string,
  emptyValue: string,
): void {
  if (value.length === 0 || value === emptyValue) {
    params.delete(key);
    return;
  }
  params.set(key, value);
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

function useImmediateSelectFilterSync(
  planId: string,
  categorySlug: string,
  syncFiltersToUrl: () => void,
): void {
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    syncFiltersToUrl();
  }, [categorySlug, planId, syncFiltersToUrl]);
}
