"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { CALL_TASKS_REFRESH_EVENT } from "@/lib/call-tasks-refresh-event";

export function useCallTasksPendingCount(enabled: boolean): number {
  const [count, setCount] = useState(0);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      const data = await apiFetch<{ count: number }>("/call-tasks/pending-count");
      setCount(data.count);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setCount(0);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    void refetch();
    function onRefresh() {
      void refetch();
    }
    window.addEventListener(CALL_TASKS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CALL_TASKS_REFRESH_EVENT, onRefresh);
    };
  }, [enabled, refetch]);

  return count;
}
