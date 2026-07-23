"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { MARKETING_SCROLL_REVEAL_MOTION } from "@/components/marketing/marketing-scroll-reveal-motion";
import revealStyles from "@/components/marketing/marketing-scroll-reveal.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { isLocaleSwitchScrollPending } from "@/lib/locale-switch-scroll";

/** Safari IO fallback — same cards must not stay invisible if observer misses. */
const PACKAGES_SLOT_REVEAL_FALLBACK_MS = 600;

type PackagesSlotRevealProps = {
  index: number;
  gridColumns: number;
  children: ReactNode;
};

function rowStaggerDelayMs(
  index: number,
  gridColumns: number,
  staggerSec: number,
): number {
  return (index % gridColumns) * staggerSec * 1000;
}

/**
 * Chrome-parity scroll reveal on an inner layer — flex accordion slot stays layout-only.
 */
export function PackagesSlotReveal({
  index,
  gridColumns,
  children,
}: PackagesSlotRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [skipEntrance] = useState(() => isLocaleSwitchScrollPending());
  const ref = useRef<HTMLDivElement>(null);
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

    const fallbackTimer = window.setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, PACKAGES_SLOT_REVEAL_FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [skipEntrance]);

  const motionStyle: CSSProperties = {
    ["--marketing-reveal-offset" as string]: `${MARKETING_SCROLL_REVEAL_MOTION.offsetPx}px`,
    ["--marketing-reveal-duration" as string]: `${MARKETING_SCROLL_REVEAL_MOTION.durationSec}s`,
    ["--marketing-reveal-duration-reduced" as string]: `${MARKETING_SCROLL_REVEAL_MOTION.reducedMotionDurationSec}s`,
    ["--marketing-reveal-delay" as string]: `${rowStaggerDelayMs(index, gridColumns, MARKETING_SCROLL_REVEAL_MOTION.staggerSec)}ms`,
  };

  const motionClassName = skipEntrance
    ? revealStyles.revealSkipEntrance
    : visible
      ? reducedMotion
        ? `${revealStyles.revealEnter} ${revealStyles.revealEnterReduced}`
        : `${revealStyles.revealEnter} ${revealStyles.revealEnterVisible}`
      : revealStyles.revealEnter;

  return (
    <div
      ref={ref}
      className={`${accordionStyles.slotReveal} ${revealStyles.revealSlot} ${motionClassName}`}
      style={motionStyle}
    >
      {children}
    </div>
  );
}
