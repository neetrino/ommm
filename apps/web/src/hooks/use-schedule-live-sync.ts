"use client";

import { useEffect } from "react";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notifications-refresh-event";
import { SCHEDULE_FALLBACK_POLL_MS } from "@/lib/public-schedule-constants";

type UseScheduleLiveSyncOptions = {
  enabled?: boolean;
  onSync: () => void;
  /** Poll interval; defaults to SSE disconnect fallback (60s). */
  intervalMs?: number;
};

/**
 * Fallback schedule sync while SSE is disconnected, plus same-browser
 * {@link NOTIFICATIONS_REFRESH_EVENT} refresh for instant local UX.
 */
export function useScheduleLiveSync({
  enabled = true,
  onSync,
  intervalMs = SCHEDULE_FALLBACK_POLL_MS,
}: UseScheduleLiveSyncOptions): void {
  const debouncedSync = useDebouncedCallback(onSync, 200);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const syncIfVisible = (): void => {
      if (document.visibilityState === "visible") {
        onSync();
      }
    };

    const intervalId = window.setInterval(syncIfVisible, intervalMs);

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        onSync();
      }
    };

    const handleRefreshEvent = (): void => {
      debouncedSync();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
    };
  }, [debouncedSync, enabled, intervalMs, onSync]);
}
