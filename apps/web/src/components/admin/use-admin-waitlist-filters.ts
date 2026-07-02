"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  WAITLIST_CLASS_TYPE_KEY,
  WAITLIST_ORDER_KEY,
  WAITLIST_SEARCH_KEY,
} from "@/components/admin/admin-waitlist-management.constants";
import {
  parseAdminWaitlistSortOrder,
  type AdminWaitlistSortOrder,
} from "@/components/admin/admin-waitlist-query";
import { resetListPageQuery } from "@/lib/list-pagination";

export function useAdminWaitlistFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearchDraft = searchParams.get(WAITLIST_SEARCH_KEY)?.trim() ?? "";
  const [searchDraft, setSearchDraft] = useState(urlSearchDraft);
  const [prevUrlSearchDraft, setPrevUrlSearchDraft] = useState(urlSearchDraft);
  if (urlSearchDraft !== prevUrlSearchDraft) {
    setPrevUrlSearchDraft(urlSearchDraft);
    setSearchDraft(urlSearchDraft);
  }
  const classTypeFilter = searchParams.get(WAITLIST_CLASS_TYPE_KEY)?.trim() ?? "";
  const orderFilter = parseAdminWaitlistSortOrder(
    searchParams.get(WAITLIST_ORDER_KEY) ?? undefined,
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
      const current = searchParams.get(WAITLIST_SEARCH_KEY)?.trim() ?? "";
      if (trimmed === current) {
        return;
      }
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (trimmed.length > 0) {
          params.set(WAITLIST_SEARCH_KEY, trimmed);
        } else {
          params.delete(WAITLIST_SEARCH_KEY);
        }
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [replaceSearchParams, searchDraft, searchParams]);

  const filterValues = useMemo(
    () => ({
      [WAITLIST_CLASS_TYPE_KEY]: classTypeFilter,
      [WAITLIST_ORDER_KEY]: orderFilter,
    }),
    [classTypeFilter, orderFilter],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === WAITLIST_CLASS_TYPE_KEY) {
        replaceSearchParams((params) => {
          resetListPageQuery(params);
          if (value.trim().length > 0) {
            params.set(WAITLIST_CLASS_TYPE_KEY, value);
          } else {
            params.delete(WAITLIST_CLASS_TYPE_KEY);
          }
        });
        return;
      }
      if (key === WAITLIST_ORDER_KEY) {
        replaceSearchParams((params) => {
          resetListPageQuery(params);
          const nextOrder = parseAdminWaitlistSortOrder(value) as AdminWaitlistSortOrder;
          if (nextOrder === "newest") {
            params.delete(WAITLIST_ORDER_KEY);
          } else {
            params.set(WAITLIST_ORDER_KEY, nextOrder);
          }
        });
      }
    },
    [replaceSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchDraft("");
    replaceSearchParams((params) => {
      resetListPageQuery(params);
      params.delete(WAITLIST_SEARCH_KEY);
      params.delete(WAITLIST_CLASS_TYPE_KEY);
      params.delete(WAITLIST_ORDER_KEY);
    });
  }, [replaceSearchParams]);

  return {
    searchDraft,
    setSearchDraft,
    classTypeFilter,
    orderFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
    replaceSearchParams,
  };
}
