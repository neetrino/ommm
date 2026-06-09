import type { CSSProperties, ReactNode } from "react";
import {
  COACHES_PAGE_LAYOUT,
  COACHES_PAGE_SURFACE,
} from "@/components/marketing/coaches/coaches-page-tokens";
import {
  MARKETING_INNER_PAGE_CONTAINER_CLASS,
} from "@/components/marketing/marketing-content-layout";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import { MARKETING_INNER_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";
import alignStyles from "@/components/marketing/marketing-inner-page-align.module.css";
import styles from "@/components/marketing/marketing-public-page-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

export type MarketingPublicPageSectionProps = {
  title: string;
  lead?: string;
  eyebrow?: string;
  /** Optional action aligned with the title row (e.g. schedule “My account”). */
  headerAside?: ReactNode;
  /** Extra `data-*` markers on the section root (e.g. coaches hero ink override). */
  sectionMarkers?: Record<string, string>;
  /** Scroll-triggered entrance on hero + content (schedule and similar inner routes). */
  scrollReveal?: boolean;
  children: ReactNode;
};

/** CSS variables for coaches Figma hero spacing — shared with route loading shell. */
export const MARKETING_PUBLIC_PAGE_SECTION_STYLE = {
  "--coaches-page-heading-color": COACHES_PAGE_SURFACE.heading,
  "--coaches-page-lead-color": COACHES_PAGE_SURFACE.lead,
  "--coaches-page-hero-padding-top": `clamp(5.75rem, ${((COACHES_PAGE_LAYOUT.heroTitleTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx) / COACHES_PAGE_LAYOUT.artboardWidthPx) * 100}vw, 10.5rem)`,
  "--coaches-page-hero-mobile-gap": `${COACHES_PAGE_LAYOUT.heroTitleMobileGapBelowHeaderRem}rem`,
  "--coaches-page-hero-lead-gap": `clamp(0.75rem, ${((COACHES_PAGE_LAYOUT.heroLeadTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx - (COACHES_PAGE_LAYOUT.heroTitleTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx)) / COACHES_PAGE_LAYOUT.artboardWidthPx) * 100}vw, 1.75rem)`,
  "--coaches-page-content-margin-top": `clamp(1.25rem, ${((COACHES_PAGE_LAYOUT.gridTopPx + COACHES_PAGE_LAYOUT.heroOffsetExtraPx - COACHES_PAGE_LAYOUT.heroLeadTopPx - COACHES_PAGE_LAYOUT.heroOffsetExtraPx - 24) / COACHES_PAGE_LAYOUT.artboardWidthPx) * 100}vw, 2.25rem)`,
} as CSSProperties;

/**
 * Figma **Coaches** `62:2182` — shared hero + content shell for marketing inner routes.
 */
export function MarketingPublicPageSection({
  title,
  lead,
  eyebrow,
  headerAside,
  sectionMarkers,
  scrollReveal = false,
  children,
}: MarketingPublicPageSectionProps) {
  const hasHeaderAside = headerAside !== undefined && headerAside !== null;

  const hero = (
    <header className={styles.hero}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      {hasHeaderAside ? (
        <div className={styles.heroRow}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.heroAside}>{headerAside}</div>
        </div>
      ) : (
        <h1 className={styles.title}>{title}</h1>
      )}
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );

  const content = (
    <div className={`${styles.content} ${alignStyles.innerPageContent}`}>{children}</div>
  );

  return (
    <section
      {...{ [MARKETING_INNER_PAGE_MARKER]: "" }}
      {...sectionMarkers}
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={MARKETING_PUBLIC_PAGE_SECTION_STYLE}
    >
      <div className={MARKETING_INNER_PAGE_CONTAINER_CLASS}>
        {scrollReveal ? (
          <>
            <MarketingPageSectionReveal index={0}>{hero}</MarketingPageSectionReveal>
            <MarketingPageSectionReveal index={1}>{content}</MarketingPageSectionReveal>
          </>
        ) : (
          <>
            {hero}
            {content}
          </>
        )}
      </div>
    </section>
  );
}

export { styles as marketingPublicPageSectionStyles };
