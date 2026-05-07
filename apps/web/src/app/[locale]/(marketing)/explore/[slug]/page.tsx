import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  if (!res.ok || !res.data) {
    notFound();
  }

  const post = res.data;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {post.type}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
        {post.title}
      </h1>
      {post.publishedAt ? (
        <p className="mt-3 text-sm text-zinc-500">
          {new Date(post.publishedAt).toLocaleDateString(locale, {
            dateStyle: "long",
          })}
        </p>
      ) : null}
      {post.excerpt ? (
        <p className="mt-6 text-lg text-zinc-700">{post.excerpt}</p>
      ) : null}
      {post.body ? (
        <div className="prose prose-zinc mt-8 max-w-none whitespace-pre-wrap">
          {post.body}
        </div>
      ) : null}
      <p className="mt-10">
        <Link href="/explore" className="text-sm font-medium text-zinc-900 underline">
          ← Back to Explore
        </Link>
      </p>
    </article>
  );
}
