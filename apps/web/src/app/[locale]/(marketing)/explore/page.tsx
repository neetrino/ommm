import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { serverApiJson } from "@/lib/server-api";

type ContentPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: string;
  publishedAt: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations("nav");
  const tExp = await getTranslations("marketingPages.explore");
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
  const t = await getTranslations("marketingPages.explore");
  const res = await serverApiJson<ContentPost[]>("/content/posts", "");

  return (
    <MarketingPageFrame
      eyebrow={t("eyebrow")}
      title={t("listTitle")}
      lede={t("lede")}
    >
      {!res.ok ? (
        <p className="app-alert-warn mt-12" role="status">
          {t("loadError", { status: res.status })}
        </p>
      ) : res.data.length === 0 ? (
        <p
          className="ommm-card mt-12 p-5 text-sm text-sage-500 sm:p-6"
          role="status"
        >
          {t("empty")} {t("emptyAdminHint")}
        </p>
      ) : (
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
                  {new Date(post.publishedAt).toLocaleDateString(locale, {
                    dateStyle: "medium",
                  })}
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
      )}
    </MarketingPageFrame>
  );
}
