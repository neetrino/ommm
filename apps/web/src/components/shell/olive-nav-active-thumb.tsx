"use client";

import { motion, useReducedMotion } from "framer-motion";

const OLIVE_NAV_PILL_DURATION_SEC = 0.38;
const OLIVE_NAV_PILL_EASE = [0.22, 1, 0.36, 1] as const;

type OliveNavActiveThumbProps = {
  layoutId: string;
};

/** Sliding white pill for the olive sidebar — moves with the active nav row. */
export function OliveNavActiveThumb({ layoutId }: OliveNavActiveThumbProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      layoutId={layoutId}
      className="ommm-admin-nav-active-thumb"
      aria-hidden
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              type: "tween",
              duration: OLIVE_NAV_PILL_DURATION_SEC,
              ease: OLIVE_NAV_PILL_EASE,
            }
      }
    />
  );
}
