"use client";

import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  PACKAGES_SOLD_LIST_PAGE_SIZE,
  PACKAGES_SOLD_SEARCH_DEBOUNCE_MS,
  PACKAGES_SOLD_SEARCH_QUERY_KEY,
} from "@/components/admin/admin-packages-sold";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

export function useSoldPackagesUrlState(initialQuery: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = usePropSyncedState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const searchParamsRef = useRef(searchParams.toString());
  const listPage = useMemo(() => soldListPageFromSearch(searchParams), [searchParams]);

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

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

  useDebouncedSearchSync(search, replaceQuery);

  const setListPage = useCallback(
    (page: number) => {
      replaceQuery((params) => {
        syncListPageQuery(params, page);
      });
    },
    [replaceQuery],
  );

  return { search, setSearch, listPage, setListPage, isPending, router };
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

function useDebouncedSearchSync(
  search: string,
  replaceQuery: (mutator: (params: URLSearchParams) => void) => void,
): void {
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      replaceQuery((params) => {
        const trimmed = search.trim();
        if (trimmed.length === 0) {
          params.delete(PACKAGES_SOLD_SEARCH_QUERY_KEY);
        } else {
          params.set(PACKAGES_SOLD_SEARCH_QUERY_KEY, trimmed);
        }
        resetListPageQuery(params);
      });
    }, PACKAGES_SOLD_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [replaceQuery, search]);
}
