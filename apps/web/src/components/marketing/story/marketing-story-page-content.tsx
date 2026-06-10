import { MarketingStoryClosingSection } from "@/components/marketing/story/marketing-story-closing-section";
import { MarketingStoryFeatureCards } from "@/components/marketing/story/marketing-story-feature-cards";
import stackStyles from "@/components/marketing/story/marketing-story-hero-feature-stack.module.css";
import { MarketingStoryHero } from "@/components/marketing/story/marketing-story-hero";
import { MarketingStoryValuesSection } from "@/components/marketing/story/marketing-story-values-section";

type MarketingStoryPageContentProps = {
  locale: string;
};

/** Full Story page sections in Figma order. */
export function MarketingStoryPageContent({ locale }: MarketingStoryPageContentProps) {
  return (
    <>
      <div className={stackStyles.stack}>
        <MarketingStoryHero locale={locale} />
        <MarketingStoryFeatureCards locale={locale} revealClassName={stackStyles.featureReveal} />
      </div>
      <MarketingStoryValuesSection locale={locale} />
      <MarketingStoryClosingSection locale={locale} />
    </>
  );
}
