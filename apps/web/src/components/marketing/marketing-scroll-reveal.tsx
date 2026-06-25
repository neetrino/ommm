"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  MARKETING_SCROLL_REVEAL_MOTION,
  type MarketingScrollRevealEntrance,
  type MarketingScrollRevealMotionProfile,
} from "@/components/marketing/marketing-scroll-reveal-motion";
import revealStyles from "@/components/marketing/marketing-scroll-reveal.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { isLocaleSwitchScrollPending } from "@/lib/locale-switch-scroll";

export type MarketingScrollRevealProps = {
  index: number;
  gridColumns: number;
  children: ReactNode;
  className?: string;
  entrance?: MarketingScrollRevealEntrance;
  profile?: MarketingScrollRevealMotionProfile;
};

function rowStaggerDelayMs(
  index: number,
  gridColumns: number,
  staggerSec: number,
): number {
  return (index % gridColumns) * staggerSec * 1000;
}

function revealStyleVars(
  index: number,
  gridColumns: number,
  profile: MarketingScrollRevealMotionProfile,
): CSSProperties {
  return {
    ["--marketing-reveal-offset" as string]: `${profile.offsetPx}px`,
    ["--marketing-reveal-duration" as string]: `${profile.durationSec}s`,
    ["--marketing-reveal-duration-reduced" as string]: `${profile.reducedMotionDurationSec}s`,
    ["--marketing-reveal-delay" as string]: `${rowStaggerDelayMs(index, gridColumns, profile.staggerSec)}ms`,
  };
}

/** Scroll-triggered reveal wrapper for marketing page cards and sections. */
export function MarketingScrollReveal({
  index,
  gridColumns,
  children,
  className,
  entrance = "scroll",
  profile = MARKETING_SCROLL_REVEAL_MOTION,
}: MarketingScrollRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [skipEntrance] = useState(() => isLocaleSwitchScrollPending());
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(
    () => skipEntrance || entrance === "aboveFold",
  );

  useEffect(() => {
    if (skipEntrance || visible) {
      return undefined;
    }

    const node = ref.current;
    if (node === null) {
      return undefined;
    }

    if (entrance === "aboveFold") {
      const frame = requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => {
        cancelAnimationFrame(frame);
      };
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
  }, [entrance, skipEntrance, visible]);

  const slotClassName = className
    ? `${revealStyles.revealSlot} ${className}`
    : revealStyles.revealSlot;

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
      className={`${slotClassName} ${motionClassName}`}
      style={revealStyleVars(index, gridColumns, profile)}
    >
      {children}
    </div>
  );
}
