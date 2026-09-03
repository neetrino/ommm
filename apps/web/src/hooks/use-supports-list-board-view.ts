"use client";

import { useSyncExternalStore } from "react";
import { LIST_BOARD_VIEW_MEDIA_QUERY } from "@/lib/viewport-breakpoints";

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(LIST_BOARD_VIEW_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getClientSnapshot(): boolean {
  return window.matchMedia(LIST_BOARD_VIEW_MEDIA_QUERY).matches;
}

/**
 * SSR assumes tablet+ so the default member `list` view matches desktop HTML
 * (no board→list flash). Phones correct to card-only on the first client read.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Whether the viewport supports list (vs card-only) layout.
 * Uses `matchMedia` via `useSyncExternalStore` so soft client navigations
 * read the real viewport on the first paint (no post-mount board→list flash).
 */
export function useSupportsListBoardView(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
