import type { ReactNode } from "react";
import {
  MARKETING_PRACTICES_INNER_PAGE_SECTION_STYLE,
  MarketingPublicPageSection,
  marketingPublicPageSectionStyles,
} from "@/components/marketing/marketing-public-page-section";
import { MARKETING_PRACTICES_INNER_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";

type MarketingPublicCoachesPageSectionProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

/** Coaches route — cream page surface matching schedule (not the teal Figma gradient). */
export function MarketingPublicCoachesPageSection({
  title,
  lead,
  children,
}: MarketingPublicCoachesPageSectionProps) {
  return (
    <MarketingPublicPageSection
      title={title}
      lead={lead}
      sectionMarkers={{ [MARKETING_PRACTICES_INNER_PAGE_MARKER]: "" }}
      sectionStyle={MARKETING_PRACTICES_INNER_PAGE_SECTION_STYLE}
    >
      {children}
    </MarketingPublicPageSection>
  );
}

export { marketingPublicPageSectionStyles as marketingPublicCoachesPageSectionStyles };
