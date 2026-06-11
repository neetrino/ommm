import type { ReactNode } from "react";
import { MARKETING_INNER_PAGE_CONTAINER_CLASS } from "@/components/marketing/marketing-content-layout";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import { MARKETING_INNER_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";
import alignStyles from "@/components/marketing/marketing-inner-page-align.module.css";
import { MARKETING_PUBLIC_PAGE_SECTION_STYLE } from "@/components/marketing/marketing-public-page-section";
import styles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingSchedulePageSectionProps = {
  title: string;
  children: ReactNode;
};

/** Schedule page hero shell — matches Contact Us instant title paint. */
export function MarketingSchedulePageSection({
  title,
  children,
}: MarketingSchedulePageSectionProps) {
  return (
    <section
      {...{ [MARKETING_INNER_PAGE_MARKER]: "" }}
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={MARKETING_PUBLIC_PAGE_SECTION_STYLE}
    >
      <div className={MARKETING_INNER_PAGE_CONTAINER_CLASS}>
        <MarketingPageSectionReveal index={0}>
          <header className={styles.hero}>
            <h1 className={styles.title}>{title}</h1>
          </header>
        </MarketingPageSectionReveal>
        <div className={`${styles.content} ${alignStyles.innerPageContent}`}>{children}</div>
      </div>
    </section>
  );
}
