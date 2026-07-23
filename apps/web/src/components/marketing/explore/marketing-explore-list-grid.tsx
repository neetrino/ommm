"use client";

import { Link } from "@/i18n/navigation";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";

/** Matches `sm:grid-cols-2` on the explore list. */
const EXPLORE_LIST_GRID_COLUMNS = 2;

export type MarketingExploreListPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  type: string;
  publishedAtFormatted: string | null;
};

type MarketingExploreListGridProps = {
  posts: MarketingExploreListPost[];
  readMoreLabel: string;
};

export function MarketingExploreListGrid({
  posts,
  readMoreLabel,
}: MarketingExploreListGridProps) {
  return (
    <ul className="grid w-full min-w-0 gap-6 sm:grid-cols-2">
      {posts.map((post, index) => (
        <li key={post.slug} className="flex min-h-0 min-w-0">
          <MarketingScrollReveal
            index={index}
            gridColumns={EXPLORE_LIST_GRID_COLUMNS}
            className="h-full w-full"
          >
            <article className="ommm-card group flex h-full min-h-0 flex-col p-6 sm:p-7 ommm-marketing-card-hover">
              <p className="ommm-chip-warm shrink-0 self-start">{post.type}</p>
              <h2 className="ommm-h3 mt-4 shrink-0 text-sage-800">
                <Link
                  href={`/explore/${post.slug}`}
                  className="line-clamp-3 transition-colors group-hover:text-sand-700"
                >
                  {post.title}
                </Link>
              </h2>
              <p
                className={`mt-3 min-h-0 flex-1 text-sm leading-relaxed text-sage-500 line-clamp-4 ${
                  post.excerpt ? "" : "invisible"
                }`}
                aria-hidden={post.excerpt ? undefined : true}
              >
                {post.excerpt ?? "\u00a0"}
              </p>
              <div className="mt-4 shrink-0">
                {post.publishedAtFormatted ? (
                  <p className="text-xs text-sage-500">{post.publishedAtFormatted}</p>
                ) : null}
                <p className="mt-5">
                  <Link
                    href={`/explore/${post.slug}`}
                    className="text-sm font-semibold uppercase tracking-[0.12em] text-sand-700 underline decoration-sand-500/40 underline-offset-4 transition-colors hover:text-sand-500 hover:decoration-sand-500"
                  >
                    {readMoreLabel}
                  </Link>
                </p>
              </div>
            </article>
          </MarketingScrollReveal>
        </li>
      ))}
    </ul>
  );
}
