"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { resetListPageQuery } from "@/lib/list-pagination";
import {
  parseStaffActivityTypeFilter,
  STAFF_ACTIVITY_SEARCH_QUERY_KEY,
  STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE,
  STAFF_ACTIVITY_TYPE_FILTER_KEY,
  STAFF_ACTIVITY_TYPE_FILTERS,
  STAFF_ACTIVITY_TYPE_QUERY_KEY,
  staffActivityTypeToQueryValue,
  type StaffActivityTypeFilter,
} from "@/lib/staff-activity-filters";

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminStaffActivityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get(STAFF_ACTIVITY_SEARCH_QUERY_KEY)?.trim() ?? "";
  const [searchDraft, setSearchDraft] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchDraft(urlQuery);
  }

  const typeFilter = parseStaffActivityTypeFilter(
    searchParams.get(STAFF_ACTIVITY_TYPE_QUERY_KEY),
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

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      const current =
        searchParams.get(STAFF_ACTIVITY_SEARCH_QUERY_KEY)?.trim() ?? "";
      if (trimmed === current) {
        return;
      }
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (trimmed.length > 0) {
          params.set(STAFF_ACTIVITY_SEARCH_QUERY_KEY, trimmed);
        } else {
          params.delete(STAFF_ACTIVITY_SEARCH_QUERY_KEY);
        }
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [replaceSearchParams, searchDraft, searchParams]);

  const filterValues = useMemo(
    () => ({ [STAFF_ACTIVITY_TYPE_FILTER_KEY]: typeFilter }),
    [typeFilter],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key !== STAFF_ACTIVITY_TYPE_FILTER_KEY) {
        return;
      }
      const nextType: StaffActivityTypeFilter | "" =
        value === "" || value === STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE
          ? ""
          : STAFF_ACTIVITY_TYPE_FILTERS.includes(value as StaffActivityTypeFilter)
            ? (value as StaffActivityTypeFilter)
            : "";
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        const queryValue = staffActivityTypeToQueryValue(nextType);
        if (queryValue === STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE) {
          params.delete(STAFF_ACTIVITY_TYPE_QUERY_KEY);
        } else {
          params.set(STAFF_ACTIVITY_TYPE_QUERY_KEY, queryValue);
        }
      });
    },
    [replaceSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchDraft("");
    replaceSearchParams((params) => {
      resetListPageQuery(params);
      params.delete(STAFF_ACTIVITY_SEARCH_QUERY_KEY);
      params.delete(STAFF_ACTIVITY_TYPE_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  return {
    searchDraft,
    setSearchDraft,
    urlQuery,
    typeFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
    replaceSearchParams,
  };
}
