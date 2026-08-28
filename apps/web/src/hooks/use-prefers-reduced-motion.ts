"use client";

import { useEffect, useState } from "react";

const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

/** `false` on server and hydration — syncs after mount to avoid attribute drift. */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
    const sync = () => {
      setReducedMotion(mediaQuery.matches);
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return reducedMotion;
}
