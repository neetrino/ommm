import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serverApiJson } from "@/lib/server-api";

type ContentPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: string;
  publishedAt: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return {
    title: t("explore"),
    description: "Events, updates, and articles from Ommm studio.",
  };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const res = await serverApiJson<ContentPost[]>("/content/posts", "");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-zinc-900">Explore</h1>
      <p className="mt-4 text-zinc-600">
        Published stories from the studio CMS (`GET /v1/content/posts`).
      </p>
      {!res.ok ? (
        <p className="mt-6 text-sm text-amber-800">
          Could not load posts ({res.status}).
        </p>
      ) : res.data.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">
          No published posts yet — seed or publish from the admin content tools.
        </p>
      ) : (
        <ul className="mt-10 space-y-6">
          {res.data.map((post) => (
            <li
              key={post.slug}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {post.type}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900">
                <Link
                  href={`/explore/${post.slug}`}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt ? (
                <p className="mt-2 text-sm text-zinc-600">{post.excerpt}</p>
              ) : null}
              {post.publishedAt ? (
                <p className="mt-3 text-xs text-zinc-500">
                  {new Date(post.publishedAt).toLocaleDateString(locale, {
                    dateStyle: "medium",
                  })}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
