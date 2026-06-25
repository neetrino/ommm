import type { ReactNode } from "react";
import { MARKETING_INNER_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";
import styles from "@/components/marketing/story/marketing-story-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryPageSectionProps = {
  children: ReactNode;
};

/** Story page shell — hero is full-bleed; following sections use the inner page container. */
export function MarketingStoryPageSection({ children }: MarketingStoryPageSectionProps) {
  return (
    <section
      {...{ [MARKETING_INNER_PAGE_MARKER]: "" }}
      className={`${marketingMontserrat.variable} ${styles.section}`}
    >
      {children}
    </section>
  );
}
