import type { ReactNode } from "react";
import { MARKETING_EXPLORE_COMING_SOON_MARKER } from "@/components/marketing/marketing-route-utils";
import styles from "@/components/marketing/explore/marketing-explore-page-section.module.css";

type MarketingExplorePageSectionProps = {
  children: ReactNode;
};

/** Explore page shell — full-bleed coming soon surface without inner-page hero chrome. */
export function MarketingExplorePageSection({ children }: MarketingExplorePageSectionProps) {
  return (
    <section
      {...{ [MARKETING_EXPLORE_COMING_SOON_MARKER]: "" }}
      className={styles.section}
    >
      {children}
    </section>
  );
}
