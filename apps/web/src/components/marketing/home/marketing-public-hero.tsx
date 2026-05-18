import { HomeHeroPhotoBanner } from "@/components/marketing/home/home-hero-photo-banner";
import { HomeWeeklyScheduleBanner } from "@/components/marketing/home/home-weekly-schedule-banner";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingPublicHeroProps = {
  locale: string;
};

/**
 * Public marketing home hero — Figma photo `155:297` + weekly schedule panel `161:301`.
 */
export async function MarketingPublicHero({ locale }: MarketingPublicHeroProps) {
  return (
    <div className={`${marketingMontserrat.variable} w-full min-w-0 overflow-x-clip`}>
      <HomeHeroPhotoBanner locale={locale} />
      <HomeWeeklyScheduleBanner locale={locale} />
    </div>
  );
}
