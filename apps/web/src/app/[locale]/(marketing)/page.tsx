import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { HomeCoachesSectionDeferred, HomeGallerySectionDeferred } from "@/components/marketing/home/home-deferred-sections";
import {
  HomeClassesSectionDeferred,
  HomePlansSectionDeferred,
} from "@/components/marketing/home/home-deferred-server-sections";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";
import homePageStyles from "@/components/marketing/home/marketing-home-page.module.css";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";
import { ProgressiveRevealSection } from "@/components/marketing/home/progressive-reveal-section";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
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

  return (
    <div
      className={`${marketingMontserrat.variable} ${homePageStyles.page} flex-1`}
      style={
        {
          "--home-page-bg": HOME_PAGE_SURFACE.pageBackground,
        } as CSSProperties
      }
    >
      <div className={homePageStyles.pageUpper}>
        <MarketingPublicHero locale={locale} />

        <ProgressiveRevealSection
          id="classes"
          preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
          mountMarginPx={HOME_LAZY_SECTION.classesMountMarginPx}
          placeholderClassName={HOME_LAZY_SECTION.placeholders.classes}
        >
          <HomeClassesSectionDeferred locale={locale} />
        </ProgressiveRevealSection>

        <ProgressiveRevealSection
          id="coaches"
          preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
          mountMarginPx={HOME_LAZY_SECTION.mountMarginPx}
          placeholderClassName={HOME_LAZY_SECTION.placeholders.coaches}
        >
          <HomeCoachesSectionDeferred />
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
            "--home-gallery-footer-seam-bg": HOME_PAGE_SURFACE.coachesGradientTo,
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
