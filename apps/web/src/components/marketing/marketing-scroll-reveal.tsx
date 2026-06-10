"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { marketingScrollRevealMotionProps } from "@/components/marketing/marketing-scroll-reveal-motion";
import revealStyles from "@/components/marketing/marketing-scroll-reveal.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type MarketingScrollRevealProps = {
  index: number;
  gridColumns: number;
  children: ReactNode;
  className?: string;
};

/** Scroll-triggered reveal wrapper for marketing page cards and sections. */
export function MarketingScrollReveal({
  index,
  gridColumns,
  children,
  className,
}: MarketingScrollRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const slotClassName = className
    ? `${revealStyles.revealSlot} ${className}`
    : revealStyles.revealSlot;

  return (
    <m.div
      className={slotClassName}
      {...marketingScrollRevealMotionProps(index, reducedMotion, gridColumns)}
    >
      {children}
    </m.div>
  );
}
