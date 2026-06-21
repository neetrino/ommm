import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchExplorePost } from "@/components/marketing/explore/explore-post-data";
import { MarketingExplorePostPageContent } from "@/components/marketing/explore/marketing-explore-post-page-content";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";
import { ensureMarketingSectionEnabled } from "@/server/ensure-marketing-section-enabled";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await fetchExplorePost(slug, locale);
  if (!res.ok) {
    return { title: "Post" };
  }
  return {
    title: res.data.title,
    description: res.data.excerpt ?? undefined,
  };
}

export default async function ExplorePostPage({ params }: Props) {
  await ensureMarketingSectionEnabled("explore");
  const { locale, slug } = await params;

  return (
    <Suspense fallback={<MarketingPageContentSkeleton cards={1} />}>
      <MarketingExplorePostPageContent locale={locale} slug={slug} />
    </Suspense>
  );
}
