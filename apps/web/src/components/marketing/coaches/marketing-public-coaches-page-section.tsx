import type { ReactNode } from "react";
import {
  MarketingPublicPageSection,
  marketingPublicPageSectionStyles,
} from "@/components/marketing/marketing-public-page-section";
import { MARKETING_COACHES_HERO_MARKER } from "@/components/marketing/marketing-route-utils";

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
    <MarketingPublicPageSection
      title={title}
      lead={lead}
      sectionMarkers={{ [MARKETING_COACHES_HERO_MARKER]: "" }}
    >
      {children}
    </MarketingPublicPageSection>
  );
}

export { marketingPublicPageSectionStyles as marketingPublicCoachesPageSectionStyles };
