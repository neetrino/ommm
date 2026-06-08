"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { coachesPageRevealMotionProps } from "@/components/marketing/coaches/coaches-page-reveal-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import revealStyles from "@/components/marketing/coaches/coaches-page-reveal.module.css";

type CoachesPageRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
};

/** Scroll-triggered reveal wrapper for coaches page cards and footer. */
export function CoachesPageReveal({ index, children, className }: CoachesPageRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const slotClassName = className
    ? `${revealStyles.revealSlot} ${className}`
    : revealStyles.revealSlot;

  return (
    <motion.div
      className={slotClassName}
      {...coachesPageRevealMotionProps(index, reducedMotion)}
    >
      {children}
    </motion.div>
  );
}
