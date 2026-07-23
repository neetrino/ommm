import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingExploreComingSoon } from "@/components/marketing/explore/marketing-explore-coming-soon";
import { MarketingExplorePageSection } from "@/components/marketing/explore/marketing-explore-page-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [tNav, tExp] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "marketingPages.explore" }),
  ]);
  return {
    title: tNav("explore"),
    description: tExp("metaDescription"),
  };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <MarketingExplorePageSection>
      <MarketingExploreComingSoon locale={locale} />
    </MarketingExplorePageSection>
  );
}
