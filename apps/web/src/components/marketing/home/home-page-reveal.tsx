"use client";

import type { ReactNode } from "react";
import { HOME_PAGE_SCROLL_REVEAL } from "@/components/marketing/home/home-page-scroll-reveal-tokens";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";

type HomePageRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
  gridColumns?: number;
  entrance?: "scroll" | "aboveFold";
};

/** Scroll-triggered reveal wrapper for home page sections and cards. */
export function HomePageReveal({
  index,
  children,
  className,
  gridColumns = HOME_PAGE_SCROLL_REVEAL.sectionGridColumns,
  entrance,
}: HomePageRevealProps) {
  return (
    <MarketingScrollReveal
      index={index}
      gridColumns={gridColumns}
      className={className}
      entrance={entrance}
    >
      {children}
    </MarketingScrollReveal>
  );
}
