import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

export async function MarketingExploreListContent({
  locale,
}: MarketingExploreListContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.explore" });
  const res = await fetchPublicJsonCached<ContentPost[]>("/content/posts");

  if (!res.ok) {
    return (
      <p className="app-alert-warn mt-12" role="status">
        {t("loadError", { status: res.status })}
      </p>
    );
  }

  if (res.data.length === 0) {
    return (
      <p
        className="ommm-card mt-12 p-5 text-sm text-sage-500 sm:p-6"
        role="status"
      >
        {t("empty")} {t("emptyAdminHint")}
      </p>
    );
  }

  return (
    <ul className="mt-12 grid gap-6 sm:grid-cols-2">
      {res.data.map((post) => (
        <li
          key={post.slug}
          className="ommm-card group p-6 sm:p-7 ommm-marketing-card-hover"
        >
          <p className="ommm-chip-warm">{post.type}</p>
          <h2 className="ommm-h3 mt-4 text-sage-800">
            <Link
              href={`/explore/${post.slug}`}
              className="transition-colors group-hover:text-sand-700"
            >
              {post.title}
            </Link>
          </h2>
          {post.excerpt ? (
            <p className="mt-3 text-sm leading-relaxed text-sage-500">
              {post.excerpt}
            </p>
          ) : null}
          {post.publishedAt ? (
            <p className="mt-4 text-xs text-sage-500">
              {formatDateForUi(post.publishedAt)}
            </p>
          ) : null}
          <p className="mt-5">
            <Link
              href={`/explore/${post.slug}`}
              className="text-sm font-semibold uppercase tracking-[0.12em] text-sand-700 underline decoration-sand-500/40 underline-offset-4 transition-colors hover:text-sand-500 hover:decoration-sand-500"
            >
              {t("readMore")}
            </Link>
          </p>
        </li>
      ))}
    </ul>
  );
}
