import { getTranslations } from "next-intl/server";
import {
  MarketingExploreListGrid,
  type MarketingExploreListPost,
} from "@/components/marketing/explore/marketing-explore-list-grid";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { formatDateForUi } from "@/lib/date-display";

type ContentPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: string;
  publishedAt: string | null;
};

type MarketingExploreListContentProps = {
  locale: string;
};

function toListPost(post: ContentPost): MarketingExploreListPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    type: post.type,
    publishedAtFormatted: post.publishedAt
      ? formatDateForUi(post.publishedAt)
      : null,
  };
}

export async function MarketingExploreListContent({
  locale,
}: MarketingExploreListContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.explore" });
  const res = await fetchPublicJsonCached<ContentPost[]>(
    `/content/posts?locale=${encodeURIComponent(locale)}`,
  );

  if (!res.ok) {
    return (
      <p className="app-alert-warn" role="status">
        {t("loadError", { status: res.status })}
      </p>
    );
  }

  if (res.data.length === 0) {
    return (
      <p
        className="ommm-card p-5 text-sm text-sage-500 sm:p-6"
        role="status"
      >
        {t("empty")} {t("emptyAdminHint")}
      </p>
    );
  }

  return (
    <MarketingExploreListGrid
      posts={res.data.map(toListPost)}
      readMoreLabel={t("readMore")}
    />
  );
}
