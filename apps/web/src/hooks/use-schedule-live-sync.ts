"use client";

import { useEffect } from "react";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notifications-refresh-event";
import { SCHEDULE_LIVE_POLL_INTERVAL_MS } from "@/lib/public-schedule-constants";

type UseScheduleLiveSyncOptions = {
  enabled?: boolean;
  onSync: () => void;
};

/**
 * Keeps the public schedule list fresh while the tab is visible.
 * Cross-user booking/cancel updates arrive via polling; same-browser actions also
 * trigger an immediate debounced sync through {@link NOTIFICATIONS_REFRESH_EVENT}.
 */
export function useScheduleLiveSync({
  enabled = true,
  onSync,
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

    const intervalId = window.setInterval(syncIfVisible, SCHEDULE_LIVE_POLL_INTERVAL_MS);

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
  }, [debouncedSync, enabled, onSync]);
}
