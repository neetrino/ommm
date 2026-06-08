"use client";

import type { ReactNode } from "react";
import { COACHES_PAGE_LAYOUT } from "@/components/marketing/coaches/coaches-page-tokens";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";

type CoachesPageRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
};

/** Scroll-triggered reveal wrapper for coaches page cards and footer. */
export function CoachesPageReveal({ index, children, className }: CoachesPageRevealProps) {
  return (
    <MarketingScrollReveal
      index={index}
      gridColumns={COACHES_PAGE_LAYOUT.gridColumns}
      className={className}
    >
      {children}
    </MarketingScrollReveal>
  );
}
