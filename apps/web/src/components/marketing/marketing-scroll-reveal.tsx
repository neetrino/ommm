"use client";

import { m } from "framer-motion";
import { type ReactNode, useState } from "react";
import { marketingScrollRevealMotionProps } from "@/components/marketing/marketing-scroll-reveal-motion";
import revealStyles from "@/components/marketing/marketing-scroll-reveal.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { isLocaleSwitchScrollPending } from "@/lib/locale-switch-scroll";

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
  const [skipEntrance] = useState(() => isLocaleSwitchScrollPending());
  const slotClassName = className
    ? `${revealStyles.revealSlot} ${className}`
    : revealStyles.revealSlot;

  return (
    <m.div
      className={slotClassName}
      {...marketingScrollRevealMotionProps(
        index,
        reducedMotion,
        gridColumns,
        skipEntrance,
      )}
    >
      {children}
    </m.div>
  );
}
