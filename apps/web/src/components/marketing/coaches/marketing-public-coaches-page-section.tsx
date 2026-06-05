import type { ReactNode } from "react";
import {
  MarketingPublicPageSection,
  marketingPublicPageSectionStyles,
} from "@/components/marketing/marketing-public-page-section";

type MarketingPublicCoachesPageSectionProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

/** Coaches route — requires hero lead per Figma `62:2182`. */
export function MarketingPublicCoachesPageSection({
  title,
  lead,
  children,
}: MarketingPublicCoachesPageSectionProps) {
  return (
    <MarketingPublicPageSection title={title} lead={lead}>
      {children}
    </MarketingPublicPageSection>
  );
}

export { marketingPublicPageSectionStyles as marketingPublicCoachesPageSectionStyles };
