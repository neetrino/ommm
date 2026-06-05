import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { MarketingExploreListContent } from "@/components/marketing/explore/marketing-explore-list-content";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";

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
  const t = await getTranslations({ locale, namespace: "marketingPages.explore" });

  return (
    <MarketingPageFrame
      eyebrow={t("eyebrow")}
      title={t("listTitle")}
      lede={t("lede")}
    >
      <Suspense fallback={<MarketingPageContentSkeleton cards={2} />}>
        <MarketingExploreListContent locale={locale} />
      </Suspense>
    </MarketingPageFrame>
  );
}
