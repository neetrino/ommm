"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DEFAULT_PACKAGE_FILTER_VALUES,
  PACKAGE_SEARCH_DEBOUNCE_MS,
} from "@/components/admin/admin-packages-management.constants";
import {
  buildPackageUrlFiltersQuery,
  buildPackagesPathname,
  PACKAGE_CATEGORIES_PAGE_QUERY_KEY,
  PACKAGE_FILTER_QUERY_KEYS,
  parsePackageFiltersFromSearch,
} from "@/components/admin/admin-packages-url";
import type { PackageFilterValues } from "@/components/admin/admin-packages-types";
import { resetListPageQuery } from "@/lib/list-pagination";

type UseAdminPackagesFilterSyncParams = {
  initialFilters: PackageFilterValues;
};

export function useAdminPackagesFilterSync({ initialFilters }: UseAdminPackagesFilterSyncParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filtersRef = useRef(initialFilters);
  const searchParamsRef = useRef(searchParams.toString());
  const [filterValues, setFilterValues] = useState<PackageFilterValues>(initialFilters);
  const [searchDraft, setSearchDraft] = useState(() => initialFilters.search);
  const [prevUrlSearch, setPrevUrlSearch] = useState(() => initialFilters.search);
  const [prevSearchDraft, setPrevSearchDraft] = useState(() => initialFilters.search);
  const [prevInitialFilterStatusOrder, setPrevInitialFilterStatusOrder] = useState({
    status: initialFilters.status,
    order: initialFilters.order,
  });

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  useEffect(() => {
    filtersRef.current = filterValues;
  }, [filterValues]);

  const urlFilters = parsePackageFiltersFromSearch(
    Object.fromEntries(searchParams.entries()),
  );
  if (urlFilters.search !== prevUrlSearch) {
    setPrevUrlSearch(urlFilters.search);
    setSearchDraft(urlFilters.search);
  }

  if (searchDraft !== prevSearchDraft) {
    setPrevSearchDraft(searchDraft);
    setFilterValues((current) =>
      current.search === searchDraft ? current : { ...current, search: searchDraft },
    );
  }

  if (
    initialFilters.status !== prevInitialFilterStatusOrder.status ||
    initialFilters.order !== prevInitialFilterStatusOrder.order
  ) {
    setPrevInitialFilterStatusOrder({
      status: initialFilters.status,
      order: initialFilters.order,
    });
    setFilterValues((current) =>
      current.status === initialFilters.status && current.order === initialFilters.order
        ? current
        : {
            ...current,
            status: initialFilters.status,
            order: initialFilters.order,
          },
    );
  }

  const syncFiltersToUrl = useCallback(
    (values: PackageFilterValues) => {
      const params = new URLSearchParams(searchParamsRef.current);
      for (const key of PACKAGE_FILTER_QUERY_KEYS) {
        params.delete(key);
      }
      resetListPageQuery(params);
      params.delete(PACKAGE_CATEGORIES_PAGE_QUERY_KEY);
      const filterQuery = buildPackageUrlFiltersQuery(values);
      if (filterQuery.length > 0) {
        for (const [key, entryValue] of new URLSearchParams(filterQuery)) {
          params.set(key, entryValue);
        }
      }
      const qs = params.toString();
      if (qs === searchParamsRef.current) {
        return;
      }
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      const currentSearch =
        new URLSearchParams(searchParamsRef.current).get("search")?.trim() ?? "";
      if (trimmed === currentSearch) {
        return;
      }
      syncFiltersToUrl({ ...filtersRef.current, search: searchDraft });
    }, PACKAGE_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchDraft, syncFiltersToUrl]);

  function updatePackageFilter<K extends keyof PackageFilterValues>(
    key: K,
    value: PackageFilterValues[K],
  ): void {
    if (key === "search") {
      setSearchDraft(value);
      return;
    }
    setFilterValues((current) => {
      const next = { ...current, [key]: value };
      syncFiltersToUrl({ ...next, search: searchDraft });
      return next;
    });
  }

  function resetPackageFilters(): void {
    setSearchDraft("");
    setFilterValues(DEFAULT_PACKAGE_FILTER_VALUES);
    syncFiltersToUrl(DEFAULT_PACKAGE_FILTER_VALUES);
  }

  return {
    filterValues,
    searchDraft,
    updatePackageFilter,
    resetPackageFilters,
  };
}
