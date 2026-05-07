import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
    <article className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {post.type}
      </p>
      <h1 className="mt-3 app-page-heading">{post.title}</h1>
      {post.publishedAt ? (
        <p className="mt-4 text-sm text-zinc-500">
          {new Date(post.publishedAt).toLocaleDateString(locale, {
            dateStyle: "long",
          })}
        </p>
      ) : null}
      {post.excerpt ? (
        <p className="mt-8 text-lg font-medium leading-relaxed text-zinc-700">
          {post.excerpt}
        </p>
      ) : null}
      {post.body ? (
        <div className="mt-8 whitespace-pre-wrap text-base leading-[1.75] text-zinc-700">
          {post.body}
        </div>
      ) : null}
      <p className="mt-12 border-t border-zinc-200 pt-8">
        <Link
          href="/explore"
          className="app-btn-secondary inline-flex text-sm"
        >
          ← {tNav("explore")}
        </Link>
      </p>
    </article>
  );
}
