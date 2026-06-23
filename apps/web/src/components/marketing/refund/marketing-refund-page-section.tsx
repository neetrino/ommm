import type { ReactNode } from "react";
import { MARKETING_INNER_PAGE_CONTAINER_CLASS } from "@/components/marketing/marketing-content-layout";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import {
  MARKETING_INNER_PAGE_MARKER,
  MARKETING_POLICY_PAGE_MARKER,
} from "@/components/marketing/marketing-route-utils";
import { POLICY_PAGE_SURFACE } from "@/components/marketing/policy/policy-page-tokens";
import alignStyles from "@/components/marketing/marketing-inner-page-align.module.css";
import { MARKETING_PUBLIC_PAGE_SECTION_STYLE } from "@/components/marketing/marketing-public-page-section";
import styles from "@/components/marketing/refund/marketing-refund-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingRefundPageSectionProps = {
  title: string;
  children: ReactNode;
};

const POLICY_PAGE_SECTION_STYLE = {
  ...MARKETING_PUBLIC_PAGE_SECTION_STYLE,
  "--coaches-page-heading-color": POLICY_PAGE_SURFACE.heading,
  "--coaches-page-lead-color": POLICY_PAGE_SURFACE.lead,
} as const;

/** Policy page shell — gallery cream surface and brown typography. */
export function MarketingRefundPageSection({
  title,
  children,
}: MarketingRefundPageSectionProps) {
  return (
    <section
      {...{ [MARKETING_INNER_PAGE_MARKER]: "" }}
      {...{ [MARKETING_POLICY_PAGE_MARKER]: "" }}
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={POLICY_PAGE_SECTION_STYLE}
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
