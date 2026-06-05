import type { ReactNode } from "react";
import {
  MARKETING_INNER_PAGE_CONTAINER_CLASS,
} from "@/components/marketing/marketing-content-layout";
import { MARKETING_INNER_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";
import alignStyles from "@/components/marketing/marketing-inner-page-align.module.css";
import { MARKETING_PUBLIC_PAGE_SECTION_STYLE } from "@/components/marketing/marketing-public-page-section";
import styles from "@/components/marketing/contact/marketing-contact-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingContactPageSectionProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

/** Contact page hero shell. */
export function MarketingContactPageSection({
  title,
  lead,
  children,
}: MarketingContactPageSectionProps) {
  return (
    <section
      {...{ [MARKETING_INNER_PAGE_MARKER]: "" }}
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={MARKETING_PUBLIC_PAGE_SECTION_STYLE}
    >
      <div className={MARKETING_INNER_PAGE_CONTAINER_CLASS}>
        <header className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>
        </header>
        <div className={`${styles.content} ${alignStyles.innerPageContent}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
