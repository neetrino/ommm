import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchExplorePost } from "@/components/marketing/explore/explore-post-data";
import { MarketingExplorePostPageContent } from "@/components/marketing/explore/marketing-explore-post-page-content";
import { MarketingRouteLoadingSkeleton } from "@/components/marketing/marketing-page-content-skeleton";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchExplorePost(slug);
  if (!res.ok) {
    return { title: "Post" };
  }
  return {
    title: res.data.title,
    description: res.data.excerpt ?? undefined,
  };
}

export default async function ExplorePostPage({ params }: Props) {
  const { locale, slug } = await params;

  return (
    <Suspense fallback={<MarketingRouteLoadingSkeleton />}>
      <MarketingExplorePostPageContent locale={locale} slug={slug} />
    </Suspense>
  );
}
