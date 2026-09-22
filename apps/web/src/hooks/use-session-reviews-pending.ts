"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_REVIEWS_REFRESH_EVENT } from "@/lib/session-reviews-events";
import type { MemberPendingReview } from "@/lib/session-reviews-types";

type PendingReviewsPayload = {
  items: MemberPendingReview[];
  latestCompletedEndsAt: string | null;
};

export function useSessionReviewsPending(enabled: boolean): {
  items: MemberPendingReview[];
  latestCompletedEndsAt: string | null;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<MemberPendingReview[]>([]);
  const [latestCompletedEndsAt, setLatestCompletedEndsAt] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<PendingReviewsPayload>("/session-reviews/pending");
      setItems(data.items);
      setLatestCompletedEndsAt(data.latestCompletedEndsAt);
    } catch (caught) {
      setError(caught instanceof ApiError);
      setItems([]);
      setLatestCompletedEndsAt(null);
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

  return { items, latestCompletedEndsAt, loading, error, refetch };
}
