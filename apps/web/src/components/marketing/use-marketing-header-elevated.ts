"use client";

import { useEffect, useState } from "react";

/** Scroll past hero header before switching to elevated liquid-glass nav pill. */
const MARKETING_HEADER_SCROLL_THRESHOLD_PX = 48;

/** True when the header should use the elevated liquid-glass treatment. */
export function useMarketingHeaderElevated(usesScrollElevation: boolean): boolean {
  const [isClientReady, setIsClientReady] = useState(false);
  const [scrollElevated, setScrollElevated] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!isClientReady || !usesScrollElevation) {
      return undefined;
    }

    const updateElevated = () => {
      setScrollElevated(window.scrollY > MARKETING_HEADER_SCROLL_THRESHOLD_PX);
    };

    updateElevated();
    window.addEventListener("scroll", updateElevated, { passive: true });
    window.addEventListener("resize", updateElevated, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateElevated);
      window.removeEventListener("resize", updateElevated);
    };
  }, [isClientReady, usesScrollElevation]);

  if (!usesScrollElevation) {
    return true;
  }

  if (!isClientReady) {
    return false;
  }

  return scrollElevated;
}
