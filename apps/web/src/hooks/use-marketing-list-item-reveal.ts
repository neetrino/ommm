"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  MARKETING_SCROLL_REVEAL_MOTION,
  type MarketingScrollRevealMotionProfile,
} from "@/components/marketing/marketing-scroll-reveal-motion";
import revealStyles from "@/components/marketing/marketing-scroll-reveal.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { isLocaleSwitchScrollPending } from "@/lib/locale-switch-scroll";

type UseMarketingListItemRevealOptions = {
  index: number;
  gridColumns: number;
  profile?: MarketingScrollRevealMotionProfile;
};

function rowStaggerDelayMs(
  index: number,
  gridColumns: number,
  staggerSec: number,
): number {
  return (index % gridColumns) * staggerSec * 1000;
}

/** CSS scroll reveal for list row elements (`<li>`). */
export function useMarketingListItemReveal({
  index,
  gridColumns,
  profile = MARKETING_SCROLL_REVEAL_MOTION,
}: UseMarketingListItemRevealOptions): {
  ref: RefObject<HTMLLIElement | null>;
  motionClassName: string;
  motionStyle: CSSProperties;
} {
  const reducedMotion = usePrefersReducedMotion();
  const skipEntrance = isLocaleSwitchScrollPending();
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (skipEntrance) {
      return undefined;
    }

    const node = ref.current;
    if (node === null) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: MARKETING_SCROLL_REVEAL_MOTION.viewportMargin,
        threshold: MARKETING_SCROLL_REVEAL_MOTION.viewportAmount,
      },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [skipEntrance]);

  const motionClassName = skipEntrance
    ? revealStyles.revealSkipEntrance
    : visible
      ? reducedMotion
        ? `${revealStyles.revealEnter} ${revealStyles.revealEnterReduced}`
        : `${revealStyles.revealEnter} ${revealStyles.revealEnterVisible}`
      : revealStyles.revealEnter;

  const motionStyle: CSSProperties = {
    ["--marketing-reveal-offset" as string]: `${profile.offsetPx}px`,
    ["--marketing-reveal-duration" as string]: `${profile.durationSec}s`,
    ["--marketing-reveal-duration-reduced" as string]: `${profile.reducedMotionDurationSec}s`,
    ["--marketing-reveal-delay" as string]: `${rowStaggerDelayMs(index, gridColumns, profile.staggerSec)}ms`,
  };

  return { ref, motionClassName, motionStyle };
}
