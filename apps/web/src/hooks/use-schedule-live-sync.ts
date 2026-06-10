"use client";

import { useEffect } from "react";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notifications-refresh-event";
import { SCHEDULE_LIVE_POLL_INTERVAL_MS, SCHEDULE_FALLBACK_POLL_MS } from "@/lib/public-schedule-constants";

type UseScheduleLiveSyncOptions = {
  enabled?: boolean;
  onSync: () => void;
  /** Poll interval; defaults to primary live sync interval. */
  intervalMs?: number;
};

/**
 * Keeps the public schedule list fresh while the tab is visible.
 * Primary cross-user updates should come from SSE; this hook supports fallback polling
 * while disconnected and same-browser {@link NOTIFICATIONS_REFRESH_EVENT} refresh.
 */
export function useScheduleLiveSync({
  enabled = true,
  onSync,
  intervalMs = SCHEDULE_LIVE_POLL_INTERVAL_MS,
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
