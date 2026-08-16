"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_REVIEWS_REFRESH_EVENT } from "@/lib/session-reviews-events";
import type { CoachInboxReview } from "@/lib/session-reviews-types";

export function useSessionReviewsCoachInbox(enabled: boolean): {
  items: CoachInboxReview[];
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<CoachInboxReview[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<{ items: CoachInboxReview[] }>(
        "/session-reviews/coach",
      );
      setItems(data.items);
    } catch (caught) {
      setError(caught instanceof ApiError);
      setItems([]);
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

  return { items, loading, error, refetch };
}
