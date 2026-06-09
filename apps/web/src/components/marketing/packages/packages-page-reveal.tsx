"use client";

import type { ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { PACKAGES_PAGE_SCROLL_REVEAL } from "@/components/marketing/packages/packages-page-scroll-reveal-tokens";

type PackagesPageRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
  gridColumns?: number;
};

/** Scroll-triggered reveal wrapper for packages page cards and sections. */
export function PackagesPageReveal({
  index,
  children,
  className,
  gridColumns = PACKAGES_PAGE_SCROLL_REVEAL.sectionGridColumns,
}: PackagesPageRevealProps) {
  return (
    <MarketingScrollReveal index={index} gridColumns={gridColumns} className={className}>
      {children}
    </MarketingScrollReveal>
  );
}
