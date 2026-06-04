import { useSyncExternalStore } from "react";

const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

/** `false` on server and on the hydration pass — avoids `matchMedia` attribute drift. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    () => window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches,
    () => false,
  );
}
