import type { ReactNode } from "react";
import { MarketingPublicPageSection } from "@/components/marketing/marketing-public-page-section";

type MarketingPageFrameProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  children: ReactNode;
};

/**
 * Shared chrome for marketing inner pages — coaches-style hero and container alignment.
 */
export function MarketingPageFrame({
  eyebrow,
  title,
  lede,
  children,
}: MarketingPageFrameProps) {
  return (
    <MarketingPublicPageSection eyebrow={eyebrow} title={title} lead={lede}>
      {children}
    </MarketingPublicPageSection>
  );
}
