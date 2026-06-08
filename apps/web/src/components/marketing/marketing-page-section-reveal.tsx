"use client";

import type { ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";

/** Single-column reveal for marketing inner page hero and content blocks. */
const MARKETING_PAGE_SECTION_REVEAL_GRID_COLUMNS = 1;

type MarketingPageSectionRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
};

/** Scroll-triggered reveal for marketing inner page section slots. */
export function MarketingPageSectionReveal({
  index,
  children,
  className,
}: MarketingPageSectionRevealProps) {
  return (
    <MarketingScrollReveal
      index={index}
      gridColumns={MARKETING_PAGE_SECTION_REVEAL_GRID_COLUMNS}
      className={className}
    >
      {children}
    </MarketingScrollReveal>
  );
}
