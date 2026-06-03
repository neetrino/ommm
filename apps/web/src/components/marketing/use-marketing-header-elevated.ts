"use client";

import { useEffect, useState } from "react";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";

/** Scroll past hero header before switching to elevated liquid-glass nav pill. */
const MARKETING_HEADER_SCROLL_THRESHOLD_PX = 48;

/** True when the header should use the elevated liquid-glass treatment. */
export function useMarketingHeaderElevated(isHome: boolean): boolean {
  const isClientMounted = useIsClientMounted();
  const [elevated, setElevated] = useState(!isHome);

  useEffect(() => {
    if (!isClientMounted) {
      return undefined;
    }

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
  }, [isClientMounted, isHome]);

  return elevated;
}
