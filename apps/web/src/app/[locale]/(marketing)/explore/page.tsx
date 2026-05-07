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
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <h1 className="app-page-heading">Explore</h1>
      <p className="app-lede">
        Published stories from the studio — news, events, and articles from the
        content tools.
      </p>
      {!res.ok ? (
        <p className="app-alert-warn mt-10" role="status">
          Could not load posts ({res.status}). Check that the API is running and
          try again.
        </p>
      ) : res.data.length === 0 ? (
        <p className="app-alert-info mt-10" role="status">
          No published posts yet — seed or publish from the admin content tools.
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {res.data.map((post) => (
            <li key={post.slug} className="app-surface-card group p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {post.type}
              </p>
              <h2 className="mt-3 text-lg font-semibold text-zinc-900 sm:text-xl">
                <Link
                  href={`/explore/${post.slug}`}
                  className="transition-colors group-hover:text-zinc-600"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt ? (
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {post.excerpt}
                </p>
              ) : null}
              {post.publishedAt ? (
                <p className="mt-4 text-xs text-zinc-500">
                  {new Date(post.publishedAt).toLocaleDateString(locale, {
                    dateStyle: "medium",
                  })}
                </p>
              ) : null}
              <p className="mt-4">
                <Link
                  href={`/explore/${post.slug}`}
                  className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
                >
                  Read more
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
