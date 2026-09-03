"use client";

import { motion, useReducedMotion } from "framer-motion";
import { OLIVE_NAV_PILL_DURATION_SEC } from "@/components/shell/olive-nav-active-thumb";

const OLIVE_SEGMENTED_PILL_EASE = [0.22, 1, 0.36, 1] as const;

type OliveSegmentedActiveThumbProps = {
  layoutId: string;
};

/** Sliding olive pill for content-hug segmented switchers (unequal tab widths). */
export function OliveSegmentedActiveThumb({ layoutId }: OliveSegmentedActiveThumbProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      layoutId={layoutId}
      className="pointer-events-none absolute inset-0 rounded-full bg-[var(--ommm-admin-olive)] shadow-sm"
      aria-hidden
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              type: "tween",
              duration: OLIVE_NAV_PILL_DURATION_SEC,
              ease: OLIVE_SEGMENTED_PILL_EASE,
            }
      }
    />
  );
}
