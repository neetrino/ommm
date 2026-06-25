import { MarketingStoryClosingSection } from "@/components/marketing/story/marketing-story-closing-section";
import { MarketingStoryHero } from "@/components/marketing/story/marketing-story-hero";
import { MarketingStoryValuesSection } from "@/components/marketing/story/marketing-story-values-section";
import {
  MARKETING_INNER_PAGE_CONTAINER_CLASS,
} from "@/components/marketing/marketing-content-layout";

type MarketingStoryPageContentProps = {
  locale: string;
};

/** Full Story page sections in Figma order. */
export function MarketingStoryPageContent({ locale }: MarketingStoryPageContentProps) {
  return (
    <>
      <MarketingStoryHero locale={locale} />
      <div className={MARKETING_INNER_PAGE_CONTAINER_CLASS}>
        <MarketingStoryValuesSection locale={locale} />
        <MarketingStoryClosingSection locale={locale} />
      </div>
    </>
  );
}
