import { ExploreSection } from "@/components/marketing/home/explore-section";
import { GiftCardBanner } from "@/components/marketing/home/gift-card-banner";
import { HomeHero } from "@/components/marketing/home/home-hero";
import { WaitlistGrid } from "@/components/marketing/home/waitlist-grid";

export default function MarketingHomePage() {
  return (
    <>
      <HomeHero />
      <WaitlistGrid />
      <ExploreSection />
      <GiftCardBanner />
    </>
  );
}
