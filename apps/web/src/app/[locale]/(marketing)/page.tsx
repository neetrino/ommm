import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import {
  HomeCoachesSectionDeferred,
  HomePlansSectionDeferred,
} from "@/components/marketing/home/home-deferred-server-sections";
import { HomeGallerySectionDeferred } from "@/components/marketing/home/home-deferred-sections";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";
import homePageStyles from "@/components/marketing/home/marketing-home-page.module.css";
import { MarketingPublicHomeClassesSection } from "@/components/marketing/home/marketing-public-home-classes-section";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { ProgressiveRevealSection } from "@/components/marketing/home/progressive-reveal-section";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { MARKETING_HOME_PAGE_MARKER } from "@/components/marketing/marketing-route-utils";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MarketingHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const scheduleDataPromise = fetchPublicScheduleItems();

  return (
    <div
      {...{ [MARKETING_HOME_PAGE_MARKER]: "" }}
      className={`${marketingMontserrat.variable} ${homePageStyles.page} flex-1`}
      style={
        {
          "--home-page-bg": HOME_PAGE_SURFACE.pageBackground,
        } as CSSProperties
      }
    >
      <div className={homePageStyles.pageUpper}>
        <MarketingPublicHero locale={locale} scheduleDataPromise={scheduleDataPromise} />

        <MarketingPublicHomeClassesSection locale={locale} />

        <ProgressiveRevealSection
          id="coaches"
          preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
          mountMarginPx={HOME_LAZY_SECTION.mountMarginPx}
          placeholderClassName={HOME_LAZY_SECTION.placeholders.coaches}
        >
          <HomeCoachesSectionDeferred locale={locale} />
        </ProgressiveRevealSection>

        <ProgressiveRevealSection
          id="plans"
          preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
          mountMarginPx={HOME_LAZY_SECTION.mountMarginPx}
          placeholderClassName={HOME_LAZY_SECTION.placeholders.plans}
        >
          <HomePlansSectionDeferred locale={locale} />
        </ProgressiveRevealSection>
      </div>

      <div
        className={homePageStyles.galleryFooterSeam}
        style={
          {
            "--home-gallery-seam-bg": HOME_PAGE_SURFACE.eventsGradientFrom,
            "--home-footer-wrap-bg": HOME_PAGE_SURFACE.eventsGradientFrom,
          } as CSSProperties
        }
      >
        <ProgressiveRevealSection
          id="gallery"
          preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
          mountMarginPx={HOME_LAZY_SECTION.mountMarginPx}
          placeholderClassName={HOME_LAZY_SECTION.placeholders.gallery}
        >
          <HomeGallerySectionDeferred />
        </ProgressiveRevealSection>

        <MarketingPublicHomeFooter locale={locale} surfaceVariant="home" />
      </div>
    </div>
  );
}
