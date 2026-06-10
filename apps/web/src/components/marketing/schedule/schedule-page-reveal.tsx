"use client";

import { m } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { marketingScrollRevealMotionProps } from "@/components/marketing/marketing-scroll-reveal-motion";
import revealStyles from "@/components/marketing/marketing-scroll-reveal.module.css";
import { SCHEDULE_PAGE_SCROLL_REVEAL } from "@/components/marketing/schedule/schedule-page-scroll-reveal-tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SchedulePageRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
  gridColumns?: number;
};

/** Scroll-triggered reveal wrapper for schedule page sections. */
export function SchedulePageReveal({
  index,
  children,
  className,
  gridColumns = SCHEDULE_PAGE_SCROLL_REVEAL.sectionGridColumns,
}: SchedulePageRevealProps) {
  return (
    <MarketingScrollReveal index={index} gridColumns={gridColumns} className={className}>
      {children}
    </MarketingScrollReveal>
  );
}

type SchedulePageListItemRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Scroll-triggered reveal for schedule session rows (`<li>`). */
export function SchedulePageListItemReveal({
  index,
  children,
  className,
  style,
}: SchedulePageListItemRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const slotClassName = className
    ? `${revealStyles.revealSlot} ${className}`
    : revealStyles.revealSlot;

  return (
    <m.li
      className={slotClassName}
      style={style}
      {...marketingScrollRevealMotionProps(
        index,
        reducedMotion,
        SCHEDULE_PAGE_SCROLL_REVEAL.sessionListGridColumns,
      )}
    >
      {children}
    </m.li>
  );
}
