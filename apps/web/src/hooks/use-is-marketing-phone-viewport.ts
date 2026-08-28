"use client";

import { useEffect, useState } from "react";

/** Matches marketing header / footer phone breakpoint. */
export const MARKETING_PHONE_VIEWPORT_MEDIA_QUERY = "(max-width: 743px)";

/**
 * Phone viewport detection — always `false` on the server and the hydration render,
 * then syncs from `matchMedia` after mount. Avoids React hydration mismatches from
 * `useSyncExternalStore` when client `matchMedia` differs from the server snapshot.
 */
export function useIsMarketingPhoneViewport(): boolean {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MARKETING_PHONE_VIEWPORT_MEDIA_QUERY);
    const sync = () => {
      setIsPhone(mediaQuery.matches);
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isPhone;
}
