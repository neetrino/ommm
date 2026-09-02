"use client";

import { useSyncExternalStore } from "react";

const SCHEDULE_DESKTOP_MEDIA_QUERY = "(min-width: 640px)";

function subscribeDesktopLayout(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(SCHEDULE_DESKTOP_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getDesktopLayoutSnapshot(): boolean {
  return window.matchMedia(SCHEDULE_DESKTOP_MEDIA_QUERY).matches;
}

/** Public schedule desktop breakpoint (≥640px) — week board vs day list. */
export function useScheduleDesktopLayout(): boolean {
  return useSyncExternalStore(
    subscribeDesktopLayout,
    getDesktopLayoutSnapshot,
    () => true,
  );
}
