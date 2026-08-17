"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { resetListPageQuery } from "@/lib/list-pagination";
import {
  parseSessionReviewIdFilter,
  parseSessionReviewRatingFilter,
  parseSessionReviewVisibilityFilter,
  SESSION_REVIEW_COACH_FILTER_KEY,
  SESSION_REVIEW_COACH_QUERY_KEY,
  SESSION_REVIEW_PACKAGE_FILTER_KEY,
  SESSION_REVIEW_PACKAGE_QUERY_KEY,
  SESSION_REVIEW_RATING_FILTER_KEY,
  SESSION_REVIEW_RATING_QUERY_KEY,
  SESSION_REVIEW_SEARCH_QUERY_KEY,
  SESSION_REVIEW_VISIBILITY_FILTER_KEY,
  SESSION_REVIEW_VISIBILITY_QUERY_KEY,
} from "@/lib/session-reviews-inbox-filters";

const SEARCH_DEBOUNCE_MS = 300;

export function useSessionReviewsInboxFilters(showVisibilityFilter: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get(SESSION_REVIEW_SEARCH_QUERY_KEY)?.trim() ?? "";
  const [searchDraft, setSearchDraft] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchDraft(urlQuery);
  }

  const ratingFilter = parseSessionReviewRatingFilter(
    searchParams.get(SESSION_REVIEW_RATING_QUERY_KEY),
  );
  const visibilityFilter = showVisibilityFilter
    ? parseSessionReviewVisibilityFilter(
        searchParams.get(SESSION_REVIEW_VISIBILITY_QUERY_KEY),
      )
    : ("" as const);
  const coachFilter = parseSessionReviewIdFilter(
    searchParams.get(SESSION_REVIEW_COACH_QUERY_KEY),
  );
  const packageFilter = parseSessionReviewIdFilter(
    searchParams.get(SESSION_REVIEW_PACKAGE_QUERY_KEY),
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
      const current = searchParams.get(SESSION_REVIEW_SEARCH_QUERY_KEY)?.trim() ?? "";
      if (trimmed === current) {
        return;
      }
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (trimmed.length > 0) {
          params.set(SESSION_REVIEW_SEARCH_QUERY_KEY, trimmed);
        } else {
          params.delete(SESSION_REVIEW_SEARCH_QUERY_KEY);
        }
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [replaceSearchParams, searchDraft, searchParams]);

  const filterValues = useMemo(() => {
    const values: Record<string, string> = {
      [SESSION_REVIEW_RATING_FILTER_KEY]: ratingFilter,
      [SESSION_REVIEW_COACH_FILTER_KEY]: coachFilter,
      [SESSION_REVIEW_PACKAGE_FILTER_KEY]: packageFilter,
    };
    if (showVisibilityFilter) {
      values[SESSION_REVIEW_VISIBILITY_FILTER_KEY] = visibilityFilter;
    }
    return values;
  }, [
    coachFilter,
    packageFilter,
    ratingFilter,
    showVisibilityFilter,
    visibilityFilter,
  ]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (key === SESSION_REVIEW_RATING_FILTER_KEY) {
          const next = parseSessionReviewRatingFilter(value);
          if (next) {
            params.set(SESSION_REVIEW_RATING_QUERY_KEY, next);
          } else {
            params.delete(SESSION_REVIEW_RATING_QUERY_KEY);
          }
        }
        if (key === SESSION_REVIEW_VISIBILITY_FILTER_KEY && showVisibilityFilter) {
          const next = parseSessionReviewVisibilityFilter(value);
          if (next) {
            params.set(SESSION_REVIEW_VISIBILITY_QUERY_KEY, next);
          } else {
            params.delete(SESSION_REVIEW_VISIBILITY_QUERY_KEY);
          }
        }
        if (key === SESSION_REVIEW_COACH_FILTER_KEY) {
          const next = parseSessionReviewIdFilter(value);
          if (next) {
            params.set(SESSION_REVIEW_COACH_QUERY_KEY, next);
          } else {
            params.delete(SESSION_REVIEW_COACH_QUERY_KEY);
          }
        }
        if (key === SESSION_REVIEW_PACKAGE_FILTER_KEY) {
          const next = parseSessionReviewIdFilter(value);
          if (next) {
            params.set(SESSION_REVIEW_PACKAGE_QUERY_KEY, next);
          } else {
            params.delete(SESSION_REVIEW_PACKAGE_QUERY_KEY);
          }
        }
      });
    },
    [replaceSearchParams, showVisibilityFilter],
  );

  const resetFilters = useCallback(() => {
    setSearchDraft("");
    replaceSearchParams((params) => {
      resetListPageQuery(params);
      params.delete(SESSION_REVIEW_SEARCH_QUERY_KEY);
      params.delete(SESSION_REVIEW_RATING_QUERY_KEY);
      params.delete(SESSION_REVIEW_VISIBILITY_QUERY_KEY);
      params.delete(SESSION_REVIEW_COACH_QUERY_KEY);
      params.delete(SESSION_REVIEW_PACKAGE_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  return {
    searchDraft,
    setSearchDraft,
    ratingFilter,
    visibilityFilter,
    coachFilter,
    packageFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
  };
}
