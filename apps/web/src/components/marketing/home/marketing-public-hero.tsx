import { Suspense } from "react";
import { HomeHeroPhotoBanner } from "@/components/marketing/home/home-hero-photo-banner";
import { HomeHeroScheduleSpacerPanel } from "@/components/marketing/home/home-hero-schedule-spacer-panel";
import { HomeWeeklyScheduleBanner } from "@/components/marketing/home/home-weekly-schedule-banner";
import { HomeWeeklyScheduleBannerLoading } from "@/components/marketing/home/home-weekly-schedule-banner-loading";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingPublicHeroProps = {
  locale: string;
  showHero?: boolean;
  showPresalePackages?: boolean;
  showScheduleBanner?: boolean;
};

/**
 * Public marketing home hero — Figma photo `196:1404` + weekly schedule panel `196:1293`.
 * When both schedule and Presale are on: Schedule first, then Presale on one continuous yellow card.
 */
export async function MarketingPublicHero({
  locale,
  showHero = true,
  showPresalePackages = true,
  showScheduleBanner = true,
}: MarketingPublicHeroProps) {
  const showHeroPanelOverlap = showPresalePackages || showScheduleBanner;
  const mergeYellowCard = showScheduleBanner && showPresalePackages;

  if (!showHero && !showPresalePackages && !showScheduleBanner) {
    return null;
  }

  return (
    <div className={`${marketingMontserrat.variable} w-full min-w-0`}>
      {showHero ? (
        <HomeHeroPhotoBanner locale={locale} showScheduleSpacer={showHeroPanelOverlap} />
      ) : null}
      {showScheduleBanner ? (
        <Suspense
          fallback={
            <HomeWeeklyScheduleBannerLoading flushBottomWithPresale={mergeYellowCard} />
          }
        >
          <HomeWeeklyScheduleBanner flushBottomWithPresale={mergeYellowCard} />
        </Suspense>
      ) : null}
      {showPresalePackages ? (
        <HomeHeroScheduleSpacerPanel
          locale={locale}
          attachBelowSchedule={mergeYellowCard}
        />
      ) : null}
    </div>
  );
}
