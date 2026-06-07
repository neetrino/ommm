"use client";

import { useSyncExternalStore } from "react";
import { LIST_BOARD_VIEW_MEDIA_QUERY } from "@/lib/viewport-breakpoints";

/** `false` on server and during hydration — avoids layout flash before `matchMedia` resolves. */
export function useSupportsListBoardView(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(LIST_BOARD_VIEW_MEDIA_QUERY);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    () => window.matchMedia(LIST_BOARD_VIEW_MEDIA_QUERY).matches,
    () => false,
  );
}
