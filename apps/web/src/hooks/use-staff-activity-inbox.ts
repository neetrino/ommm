"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import {
  dispatchStaffActivityRefresh,
  STAFF_ACTIVITY_REFRESH_EVENT,
} from "@/lib/staff-activity-refresh-event";
import type {
  StaffActivityListPayload,
  StaffActivityRow,
} from "@/lib/staff-activity-types";

export function useStaffActivityHeaderInbox(enabled: boolean): {
  items: StaffActivityRow[];
  unreadCount: number;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<StaffActivityRow[]>([]);
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
        apiFetch<StaffActivityListPayload>("/staff-activity/header"),
        apiFetch<{ count: number }>("/staff-activity/unread-count"),
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
    window.addEventListener(STAFF_ACTIVITY_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(STAFF_ACTIVITY_REFRESH_EVENT, onRefresh);
    };
  }, [enabled, refetch]);

  return { items, unreadCount, loading, error, refetch };
}

export async function markStaffActivityRead(): Promise<void> {
  await apiFetch("/staff-activity/mark-read", { method: "POST" });
  dispatchStaffActivityRefresh();
}
