import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { serverApiJson } from "@/lib/server-api";

type ContentPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  type: string;
  publishedAt: string | null;
};

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await serverApiJson<ContentPost>(`/content/posts/${slug}`, "");
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
  const res = await serverApiJson<ContentPost>(`/content/posts/${slug}`, "");
  const tNav = await getTranslations("nav");

  if (!res.ok || !res.data) {
    notFound();
  }

  const post = res.data;

  return (
    <MarketingPageFrame eyebrow={post.type} title={post.title}>
      <div className="mt-8 max-w-2xl">
        {post.publishedAt ? (
          <p className="text-sm text-sage-500">
            {new Date(post.publishedAt).toLocaleDateString(locale, {
              dateStyle: "long",
            })}
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
