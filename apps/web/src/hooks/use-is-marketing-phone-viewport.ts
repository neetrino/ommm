import { useSyncExternalStore } from "react";

/** Matches marketing header / footer phone breakpoint. */
export const MARKETING_PHONE_VIEWPORT_MEDIA_QUERY = "(max-width: 743px)";

function subscribeMarketingPhoneViewport(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MARKETING_PHONE_VIEWPORT_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMarketingPhoneViewportSnapshot(): boolean {
  return window.matchMedia(MARKETING_PHONE_VIEWPORT_MEDIA_QUERY).matches;
}

function getMarketingPhoneViewportServerSnapshot(): boolean {
  return false;
}

/** `false` on server and during hydration — desktop footer surface until `matchMedia` resolves. */
export function useIsMarketingPhoneViewport(): boolean {
  return useSyncExternalStore(
    subscribeMarketingPhoneViewport,
    getMarketingPhoneViewportSnapshot,
    getMarketingPhoneViewportServerSnapshot,
  );
}
