import { cache } from "react";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";

export type ExploreContentPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  type: string;
  publishedAt: string | null;
};

export const fetchExplorePost = cache(async (slug: string) => {
  return fetchPublicJsonCached<ExploreContentPost>(`/content/posts/${slug}`);
});
