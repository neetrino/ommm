"use client";

import { useCallback, useEffect, useState } from "react";
import type { CallTaskDuePayload, CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { ApiError, apiFetch } from "@/lib/api";
import { CALL_TASKS_REFRESH_EVENT } from "@/lib/call-tasks-refresh-event";

export function useCallTasksDue(enabled: boolean): {
  items: CallTaskRow[];
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<CallTaskRow[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<CallTaskDuePayload>("/call-tasks/due");
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
    window.addEventListener(CALL_TASKS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CALL_TASKS_REFRESH_EVENT, onRefresh);
    };
  }, [enabled, refetch]);

  return { items, loading, error, refetch };
}
