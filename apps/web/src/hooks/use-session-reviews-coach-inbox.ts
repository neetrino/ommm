"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_REVIEWS_REFRESH_EVENT } from "@/lib/session-reviews-events";
import type { CoachInboxReview, SessionReviewsListPayload } from "@/lib/session-reviews-types";
import { sessionReviewsHeaderInboxPath } from "@/lib/session-reviews-list";

export function useSessionReviewsCoachInbox(enabled: boolean): {
  items: CoachInboxReview[];
  total: number;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<CoachInboxReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<SessionReviewsListPayload<CoachInboxReview>>(
        sessionReviewsHeaderInboxPath("coach"),
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (caught) {
      setError(caught instanceof ApiError);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    queueMicrotask(() => {
      void refetch();
    });
    function onRefresh() {
      void refetch();
    }
    window.addEventListener(SESSION_REVIEWS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(SESSION_REVIEWS_REFRESH_EVENT, onRefresh);
    };
  }, [enabled, refetch]);

  return { items, total, loading, error, refetch };
}
