import { MarketingStoryGallerySection } from "@/components/marketing/story/marketing-story-gallery-section";
import { MarketingStoryFoundersVoiceBanner } from "@/components/marketing/story/marketing-story-founders-voice-banner";
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
        <MarketingStoryFoundersVoiceBanner locale={locale} />
        <MarketingStoryValuesSection locale={locale} />
      </div>
      <MarketingStoryGallerySection />
    </>
  );
}
