"use client";

import type { ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { STORY_PAGE_LAYOUT } from "@/components/marketing/story/story-page-tokens";

type StoryPageRevealProps = {
  index: number;
  children: ReactNode;
  className?: string;
  gridColumns?: number;
};

/** Scroll-triggered reveal wrapper for story page sections and cards. */
export function StoryPageReveal({
  index,
  children,
  className,
  gridColumns = STORY_PAGE_LAYOUT.revealGridColumns,
}: StoryPageRevealProps) {
  return (
    <MarketingScrollReveal index={index} gridColumns={gridColumns} className={className}>
      {children}
    </MarketingScrollReveal>
  );
}
