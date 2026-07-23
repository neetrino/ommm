import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { fetchExplorePost } from "@/components/marketing/explore/explore-post-data";
import { formatDateForUi } from "@/lib/date-display";

type MarketingExplorePostPageContentProps = {
  locale: string;
  slug: string;
};

export async function MarketingExplorePostPageContent({
  locale,
  slug,
}: MarketingExplorePostPageContentProps) {
  const [res, tNav] = await Promise.all([
    fetchExplorePost(slug, locale),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  if (!res.ok || !res.data) {
    notFound();
  }

  const post = res.data;

  return (
    <MarketingPageFrame eyebrow={post.type} title={post.title}>
      <div className="w-full min-w-0">
        {post.publishedAt ? (
          <p className="text-sm text-sage-500">
            {formatDateForUi(post.publishedAt)}
          </p>
        ) : null}
        {post.excerpt ? (
          <p className="mt-8 text-lg font-medium leading-relaxed text-sage-700">
            {post.excerpt}
          </p>
        ) : null}
        {post.body ? (
          <div className="ommm-card mt-8 p-6 sm:p-8">
            <div className="whitespace-pre-wrap text-base leading-[1.75] text-sage-500">
              {post.body}
            </div>
          </div>
        ) : null}
        <p className="mt-12 border-t border-white/50 pt-8">
          <Link href="/explore" className="ommm-cta-ghost inline-flex text-sm">
            ← {tNav("explore")}
          </Link>
        </p>
      </div>
    </MarketingPageFrame>
  );
}
