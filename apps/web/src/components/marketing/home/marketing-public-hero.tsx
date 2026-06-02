import { Suspense } from "react";
import { HomeHeroPhotoBanner } from "@/components/marketing/home/home-hero-photo-banner";
import { HomeWeeklyScheduleBanner } from "@/components/marketing/home/home-weekly-schedule-banner";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingPublicHeroProps = {
  locale: string;
};

/**
 * Public marketing home hero — Figma photo `196:1404` + weekly schedule panel `196:1293`.
 */
export async function MarketingPublicHero({ locale }: MarketingPublicHeroProps) {
  return (
    <div className={`${marketingMontserrat.variable} w-full min-w-0`}>
      <HomeHeroPhotoBanner locale={locale} />
      <Suspense fallback={<div aria-hidden className={HOME_LAZY_SECTION.placeholders.scheduleGrid} />}>
        <HomeWeeklyScheduleBanner locale={locale} />
      </Suspense>
    </div>
  );
}
