import { HomeHeroPhotoBanner } from "@/components/marketing/home/home-hero-photo-banner";
import { HomeWeeklyScheduleBanner } from "@/components/marketing/home/home-weekly-schedule-banner";
import type { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingPublicHeroProps = {
  locale: string;
  scheduleDataPromise: ReturnType<typeof fetchPublicScheduleItems>;
};

/**
 * Public marketing home hero — Figma photo `196:1404` + weekly schedule panel `196:1293`.
 */
export async function MarketingPublicHero({
  locale,
  scheduleDataPromise,
}: MarketingPublicHeroProps) {
  return (
    <div className={`${marketingMontserrat.variable} w-full min-w-0`}>
      <HomeHeroPhotoBanner locale={locale} />
      <HomeWeeklyScheduleBanner locale={locale} scheduleDataPromise={scheduleDataPromise} />
    </div>
  );
}
