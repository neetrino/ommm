import type { ReactNode } from "react";
import { MARKETING_INNER_PAGE_CONTAINER_CLASS } from "@/components/marketing/marketing-content-layout";
import {
  MARKETING_INNER_PAGE_MARKER,
  MARKETING_PRACTICES_INNER_PAGE_MARKER,
} from "@/components/marketing/marketing-route-utils";
import alignStyles from "@/components/marketing/marketing-inner-page-align.module.css";
import { MARKETING_PRACTICES_INNER_PAGE_SECTION_STYLE } from "@/components/marketing/marketing-public-page-section";
import styles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingSchedulePageSectionProps = {
  children: ReactNode;
};

/** Schedule page shell — title lives in the schedule view / mobile header. */
export function MarketingSchedulePageSection({
  children,
}: MarketingSchedulePageSectionProps) {
  return (
    <section
      {...{
        [MARKETING_INNER_PAGE_MARKER]: "",
        [MARKETING_PRACTICES_INNER_PAGE_MARKER]: "",
      }}
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={MARKETING_PRACTICES_INNER_PAGE_SECTION_STYLE}
    >
      <div className={MARKETING_INNER_PAGE_CONTAINER_CLASS}>
        <div
          className={`${styles.content} ${styles.contentFlush} ${alignStyles.innerPageContent}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
