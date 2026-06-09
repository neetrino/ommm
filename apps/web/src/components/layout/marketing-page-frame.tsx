import type { ReactNode } from "react";
import { MarketingPublicPageSection } from "@/components/marketing/marketing-public-page-section";

type MarketingPageFrameProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  /** Scroll-triggered entrance on hero + content (packages, schedule, etc.). */
  scrollReveal?: boolean;
  children: ReactNode;
};

/**
 * Shared chrome for marketing inner pages — coaches-style hero and container alignment.
 */
export function MarketingPageFrame({
  eyebrow,
  title,
  lede,
  scrollReveal = false,
  children,
}: MarketingPageFrameProps) {
  return (
    <MarketingPublicPageSection
      eyebrow={eyebrow}
      title={title}
      lead={lede}
      scrollReveal={scrollReveal}
    >
      {children}
    </MarketingPublicPageSection>
  );
}
