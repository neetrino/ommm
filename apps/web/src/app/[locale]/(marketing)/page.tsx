import { notFound } from "next/navigation";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";
import { MarketingPublicHomeClassesSection } from "@/components/marketing/home/marketing-public-home-classes-section";
import { MarketingPublicHomeCoachesSection } from "@/components/marketing/home/marketing-public-home-coaches-section";
import { MarketingPublicHomeEventsSection } from "@/components/marketing/home/marketing-public-home-events-section";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingPublicHomePlansSection } from "@/components/marketing/home/marketing-public-home-plans-section";
import { MarketingHomeScrollReveal } from "@/components/marketing/home/marketing-home-scroll-reveal";
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
      className={`${marketingMontserrat.variable} min-h-0 w-full flex-1`}
      style={{ backgroundColor: HOME_PAGE_SURFACE.pageBackground }}
    >
      <MarketingHomeScrollReveal>
        <MarketingPublicHero locale={locale} />
      </MarketingHomeScrollReveal>
      <MarketingHomeScrollReveal>
        <MarketingPublicHomeClassesSection locale={locale} />
      </MarketingHomeScrollReveal>
      <MarketingHomeScrollReveal>
        <MarketingPublicHomeCoachesSection />
      </MarketingHomeScrollReveal>
      <MarketingHomeScrollReveal>
        <MarketingPublicHomePlansSection locale={locale} />
      </MarketingHomeScrollReveal>
      <MarketingHomeScrollReveal>
        <MarketingPublicHomeEventsSection locale={locale} />
      </MarketingHomeScrollReveal>
      <MarketingHomeScrollReveal>
        <MarketingPublicHomeFooter locale={locale} />
      </MarketingHomeScrollReveal>
    </div>
  );
}
