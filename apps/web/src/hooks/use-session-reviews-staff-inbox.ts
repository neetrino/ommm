"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_REVIEWS_REFRESH_EVENT } from "@/lib/session-reviews-events";
import type { StaffInboxReview } from "@/lib/session-reviews-types";

export function useSessionReviewsStaffInbox(enabled: boolean): {
  items: StaffInboxReview[];
  unreadCount: number;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<StaffInboxReview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const [inbox, unread] = await Promise.all([
        apiFetch<{ items: StaffInboxReview[] }>("/session-reviews/inbox"),
        apiFetch<{ count: number }>("/session-reviews/inbox/unread-count"),
      ]);
      setItems(inbox.items);
      setUnreadCount(unread.count);
    } catch (caught) {
      setError(caught instanceof ApiError);
      setItems([]);
      setUnreadCount(0);
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

  return { items, unreadCount, loading, error, refetch };
}
