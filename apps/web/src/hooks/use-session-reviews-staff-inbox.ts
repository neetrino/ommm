"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_REVIEWS_REFRESH_EVENT } from "@/lib/session-reviews-events";
import type { StaffInboxReview, SessionReviewsListPayload } from "@/lib/session-reviews-types";
import { sessionReviewsHeaderInboxPath } from "@/lib/session-reviews-list";

export function useSessionReviewsStaffInbox(enabled: boolean): {
  items: StaffInboxReview[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<StaffInboxReview[]>([]);
  const [total, setTotal] = useState(0);
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
        apiFetch<SessionReviewsListPayload<StaffInboxReview>>(
          sessionReviewsHeaderInboxPath("staff"),
        ),
        apiFetch<{ count: number }>("/session-reviews/inbox/unread-count"),
      ]);
      setItems(inbox.items);
      setTotal(inbox.total);
      setUnreadCount(unread.count);
    } catch (caught) {
      setError(caught instanceof ApiError);
      setItems([]);
      setTotal(0);
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

  return { items, total, unreadCount, loading, error, refetch };
}
