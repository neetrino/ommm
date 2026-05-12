import { ExploreSection } from "@/components/marketing/home/explore-section";
import { GiftCardBanner } from "@/components/marketing/home/gift-card-banner";
import { MarketingHighlights } from "@/components/marketing/home/marketing-highlights";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";

export default function MarketingHomePage() {
  return (
    <>
      <MarketingPublicHero />
      <MarketingHighlights />
      <ExploreSection />
      <GiftCardBanner />
    </>
  );
}
