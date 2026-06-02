"use client";

import { useEffect, useState } from "react";

/** Scroll past hero header before switching to elevated liquid-glass nav pill. */
const MARKETING_HEADER_SCROLL_THRESHOLD_PX = 48;

/** True when the header should use the elevated liquid-glass treatment. */
export function useMarketingHeaderElevated(isHome: boolean): boolean {
  const [elevated, setElevated] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setElevated(true);
      return undefined;
    }

    const update = () => {
      setElevated(window.scrollY > MARKETING_HEADER_SCROLL_THRESHOLD_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  return elevated;
}
