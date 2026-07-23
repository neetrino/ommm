"use client";

import { useEffect } from "react";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notifications-refresh-event";

type UseScheduleLiveSyncOptions = {
  onSync: () => void;
};

/**
 * Same-browser schedule sync after local book/cancel.
 * Cross-tab and cross-user updates use SSE → {@link useRealtimeRefetch}.
 */
export function useScheduleLiveSync({ onSync }: UseScheduleLiveSyncOptions): void {
  const debouncedSync = useDebouncedCallback(onSync, 200);

  useEffect(() => {
    const handleRefreshEvent = (): void => {
      debouncedSync();
    };

    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);

    return () => {
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
    };
  }, [debouncedSync]);
}
