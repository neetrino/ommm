import { MarketingLazyMapEmbed } from "@/components/marketing/contact/marketing-lazy-map-embed";

type MarketingContactMapSectionProps = {
  heading: string;
  embedHtml: string;
};

/** Map block split out so the contact page can stream studio info first. */
export function MarketingContactMapSection({
  heading,
  embedHtml,
}: MarketingContactMapSectionProps) {
  return <MarketingLazyMapEmbed heading={heading} embedHtml={embedHtml} />;
}
