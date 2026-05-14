import { notFound } from "next/navigation";
import { ExploreSection } from "@/components/marketing/home/explore-section";
import { GiftCardBanner } from "@/components/marketing/home/gift-card-banner";
import { HomeMembershipsSection } from "@/components/marketing/home/home-memberships-section";
import { MarketingHighlights } from "@/components/marketing/home/marketing-highlights";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";
import { ProgressiveRevealSection } from "@/components/marketing/home/progressive-reveal-section";
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
    <>
      <MarketingPublicHero locale={locale} />
      <ProgressiveRevealSection
        id="highlights"
        placeholderClassName="h-[30rem] sm:h-[32rem]"
        revealDelayMs={40}
      >
        <MarketingHighlights locale={locale} />
      </ProgressiveRevealSection>
      <ProgressiveRevealSection
        id="memberships"
        prefetchApiPaths={["/api/v1/memberships/plans"]}
        placeholderClassName="h-[52rem] sm:h-[46rem] lg:h-[40rem]"
        revealDelayMs={65}
      >
        <HomeMembershipsSection locale={locale} />
      </ProgressiveRevealSection>
      <ProgressiveRevealSection
        id="explore"
        prefetchApiPaths={["/api/v1/content/posts"]}
        placeholderClassName="h-[60rem] sm:h-[52rem] lg:h-[48rem]"
        revealDelayMs={80}
      >
        <ExploreSection locale={locale} />
      </ProgressiveRevealSection>
      <ProgressiveRevealSection
        id="gift"
        placeholderClassName="h-[28rem] sm:h-[26rem] lg:h-[24rem]"
        revealDelayMs={120}
      >
        <GiftCardBanner locale={locale} />
      </ProgressiveRevealSection>
    </>
  );
}
