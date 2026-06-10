import type { ReactNode } from "react";
import {
  MARKETING_INNER_PAGE_CONTAINER_CLASS,
} from "@/components/marketing/marketing-content-layout";
import { COACHES_PAGE_LAYOUT } from "@/components/marketing/coaches/coaches-page-tokens";
import { MARKETING_INNER_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";
import styles from "@/components/marketing/story/marketing-story-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryPageSectionProps = {
  children: ReactNode;
};

const STORY_PAGE_SECTION_STYLE = {
  ["--coaches-page-hero-mobile-gap" as string]: `${COACHES_PAGE_LAYOUT.heroTitleMobileGapBelowHeaderRem}rem`,
} as const;

/** Story page shell — shared marketing inner-page gradient from layout shell. */
export function MarketingStoryPageSection({ children }: MarketingStoryPageSectionProps) {
  return (
    <section
      {...{ [MARKETING_INNER_PAGE_MARKER]: "" }}
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={STORY_PAGE_SECTION_STYLE}
    >
      <div className={MARKETING_INNER_PAGE_CONTAINER_CLASS}>{children}</div>
    </section>
  );
}
