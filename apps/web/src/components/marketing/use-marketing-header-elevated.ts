"use client";

import { useSyncExternalStore } from "react";

/** Scroll past hero header before switching to elevated liquid-glass nav pill. */
const MARKETING_HEADER_SCROLL_THRESHOLD_PX = 48;

function subscribeToScroll(onStoreChange: () => void): () => void {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollElevatedSnapshot(): boolean {
  return window.scrollY > MARKETING_HEADER_SCROLL_THRESHOLD_PX;
}

/** True when the header should use the elevated liquid-glass treatment. */
export function useMarketingHeaderElevated(usesScrollElevation: boolean): boolean {
  const scrollElevated = useSyncExternalStore(
    usesScrollElevation ? subscribeToScroll : () => () => undefined,
    () => (usesScrollElevation ? getScrollElevatedSnapshot() : false),
    () => false,
  );

  return !usesScrollElevation || scrollElevated;
}
