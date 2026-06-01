import { Suspense } from "react";
import { HomeHeroPhotoBanner } from "@/components/marketing/home/home-hero-photo-banner";
import { HomeWeeklyScheduleBanner } from "@/components/marketing/home/home-weekly-schedule-banner";
import { HomeWeeklyScheduleBannerSkeleton } from "@/components/marketing/home/home-weekly-schedule-banner-skeleton";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingPublicHeroProps = {
  locale: string;
};

/**
 * Public marketing home hero — Figma photo `155:297` + weekly schedule panel `161:301`.
 */
export async function MarketingPublicHero({ locale }: MarketingPublicHeroProps) {
  return (
    <div className={`${marketingMontserrat.variable} w-full min-w-0`}>
      <HomeHeroPhotoBanner locale={locale} />
      <Suspense fallback={<HomeWeeklyScheduleBannerSkeleton />}>
        <HomeWeeklyScheduleBanner locale={locale} />
      </Suspense>
    </div>
  );
}
