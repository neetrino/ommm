"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CALL_TASK_STATUS_FILTER_KEY } from "@/components/admin/admin-call-tasks-filter-fields";
import {
  CALL_TASK_SEARCH_QUERY_KEY,
  CALL_TASK_STATUS_ALL_QUERY_VALUE,
  CALL_TASK_STATUS_QUERY_KEY,
  CALL_TASK_LIST_FILTERS,
  callTaskStatusToQueryValue,
  parseCallTaskListStatus,
  type CallTaskListFilter,
} from "@/components/admin/admin-call-tasks-query";
import { resetListPageQuery } from "@/lib/list-pagination";

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminCallTasksFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get(CALL_TASK_SEARCH_QUERY_KEY)?.trim() ?? "";
  const [searchDraft, setSearchDraft] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchDraft(urlQuery);
  }

  const statusFilter = parseCallTaskListStatus(
    searchParams.get(CALL_TASK_STATUS_QUERY_KEY) ?? undefined,
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
      const current = searchParams.get(CALL_TASK_SEARCH_QUERY_KEY)?.trim() ?? "";
      if (trimmed === current) {
        return;
      }
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (trimmed.length > 0) {
          params.set(CALL_TASK_SEARCH_QUERY_KEY, trimmed);
        } else {
          params.delete(CALL_TASK_SEARCH_QUERY_KEY);
        }
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [replaceSearchParams, searchDraft, searchParams]);

  const filterValues = useMemo(
    () => ({ [CALL_TASK_STATUS_FILTER_KEY]: statusFilter }),
    [statusFilter],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key !== CALL_TASK_STATUS_FILTER_KEY) {
        return;
      }
      const nextStatus: CallTaskListFilter | "" =
        value === "" || value === CALL_TASK_STATUS_ALL_QUERY_VALUE
          ? ""
          : CALL_TASK_LIST_FILTERS.includes(value as CallTaskListFilter)
            ? (value as CallTaskListFilter)
            : "PENDING";
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        params.set(CALL_TASK_STATUS_QUERY_KEY, callTaskStatusToQueryValue(nextStatus));
      });
    },
    [replaceSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchDraft("");
    replaceSearchParams((params) => {
      resetListPageQuery(params);
      params.delete(CALL_TASK_SEARCH_QUERY_KEY);
      params.delete(CALL_TASK_STATUS_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  return {
    searchDraft,
    setSearchDraft,
    statusFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
    replaceSearchParams,
  };
}
