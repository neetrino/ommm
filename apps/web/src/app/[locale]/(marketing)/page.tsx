import { notFound } from "next/navigation";
import {
  HomeCoachesSectionDeferred,
  HomeGallerySectionDeferred,
} from "@/components/marketing/home/home-deferred-client-sections";
import { HOME_LAZY_SECTION } from "@/components/marketing/home/home-lazy-section-tokens";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";
import { MarketingPublicHomeClassesSection } from "@/components/marketing/home/marketing-public-home-classes-section";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingPublicHomePlansSection } from "@/components/marketing/home/marketing-public-home-plans-section";
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
      className={`${marketingMontserrat.variable} min-h-0 w-full min-w-0 flex-1 overflow-x-clip`}
      style={{ backgroundColor: HOME_PAGE_SURFACE.pageBackground }}
    >
      <MarketingPublicHero locale={locale} />

      <ProgressiveRevealSection
        id="classes"
        preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
        mountMarginPx={HOME_LAZY_SECTION.classesMountMarginPx}
        placeholderClassName={HOME_LAZY_SECTION.placeholders.classes}
      >
        <MarketingPublicHomeClassesSection locale={locale} />
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
        <MarketingPublicHomePlansSection locale={locale} />
      </ProgressiveRevealSection>

      <ProgressiveRevealSection
        id="gallery"
        preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
        mountMarginPx={HOME_LAZY_SECTION.mountMarginPx}
        placeholderClassName={HOME_LAZY_SECTION.placeholders.gallery}
      >
        <HomeGallerySectionDeferred />
      </ProgressiveRevealSection>

      <ProgressiveRevealSection
        id="footer"
        preloadMarginPx={HOME_LAZY_SECTION.preloadMarginPx}
        mountMarginPx={HOME_LAZY_SECTION.mountMarginPx}
        placeholderClassName={HOME_LAZY_SECTION.placeholders.footer}
      >
        <MarketingPublicHomeFooter locale={locale} />
      </ProgressiveRevealSection>
    </div>
  );
}
