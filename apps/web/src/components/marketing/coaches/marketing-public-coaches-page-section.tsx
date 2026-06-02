import type { CSSProperties, ReactNode } from "react";
import { COACHES_PAGE_LAYOUT, COACHES_PAGE_SURFACE } from "@/components/marketing/coaches/coaches-page-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import styles from "@/components/marketing/coaches/marketing-public-coaches-page-section.module.css";

type MarketingPublicCoachesPageSectionProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

const SECTION_STYLE = {
  "--coaches-page-heading-color": COACHES_PAGE_SURFACE.heading,
  "--coaches-page-lead-color": COACHES_PAGE_SURFACE.lead,
  "--coaches-page-hero-padding-top": `clamp(7rem, ${((COACHES_PAGE_LAYOUT.heroTitleTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx) / COACHES_PAGE_LAYOUT.artboardWidthPx) * 100}vw, 12.75rem)`,
  "--coaches-page-hero-lead-gap": `clamp(0.75rem, ${((COACHES_PAGE_LAYOUT.heroLeadTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx - (COACHES_PAGE_LAYOUT.heroTitleTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx)) / COACHES_PAGE_LAYOUT.artboardWidthPx) * 100}vw, 1.75rem)`,
  "--coaches-page-content-margin-top": `clamp(1.25rem, ${((COACHES_PAGE_LAYOUT.gridTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx - COACHES_PAGE_LAYOUT.heroLeadTopPx - COACHES_PAGE_LAYOUT.heroOffsetExtraPx - 24) / COACHES_PAGE_LAYOUT.artboardWidthPx) * 100}vw, 2.25rem)`,
} as CSSProperties;

/**
 * Figma **Coaches** `62:2182` — hero title, lead, and coach grid (footer handled elsewhere).
 */
export function MarketingPublicCoachesPageSection({
  title,
  lead,
  children,
}: MarketingPublicCoachesPageSectionProps) {
  return (
    <section
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={SECTION_STYLE}
    >
      <div className="ommm-container">
        <header className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}

export { styles as marketingPublicCoachesPageSectionStyles };
