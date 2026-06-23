import { MarketingLazyMapEmbed } from "@/components/marketing/contact/marketing-lazy-map-embed";

type MarketingContactMapSectionProps = {
  embedHtml: string;
};

/** Map block split out so the contact page can stream studio info first. */
export function MarketingContactMapSection({ embedHtml }: MarketingContactMapSectionProps) {
  return <MarketingLazyMapEmbed embedHtml={embedHtml} />;
}
