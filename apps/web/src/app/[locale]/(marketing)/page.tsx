import { notFound } from "next/navigation";
import { ExploreSection } from "@/components/marketing/home/explore-section";
import { GiftCardBanner } from "@/components/marketing/home/gift-card-banner";
import { MarketingHighlights } from "@/components/marketing/home/marketing-highlights";
import { MarketingPublicHero } from "@/components/marketing/home/marketing-public-hero";
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
      <MarketingHighlights locale={locale} />
      <ExploreSection locale={locale} />
      <GiftCardBanner locale={locale} />
    </>
  );
}
