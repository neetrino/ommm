import type { ContentPostRow } from "../../../lib/api/memberClient";
import type { ExploreTileMock } from "../../../lib/mocks/homeMock";
import type { ExploreFallbackContent } from "../hooks/useHomeContent";

function typeToTag(type: string): string {
  return type.replace(/_/g, " ").slice(0, 18).toUpperCase();
}

export function postsToExploreContent(
  posts: ContentPostRow[],
  fallback: ExploreFallbackContent,
): ExploreFallbackContent {
  if (posts.length === 0) {
    return {
      journalEyebrow: fallback.journalEyebrow,
      journalTitle: fallback.journalTitle,
      tiles: [...fallback.tiles],
    };
  }
  const [first, ...rest] = posts;
  const journalEyebrow = typeToTag(first.type);
  const journalTitle = first.title;
  const slice = rest.slice(0, 2);
  const tiles: ExploreTileMock[] =
    slice.length > 0
      ? slice.map((p, i) => ({
          id: p.id,
          tag: typeToTag(p.type),
          title: p.title,
          imageUriKey: i % 2 === 0 ? "exploreRetreat" : "explorePilates",
          tagVariant: i % 2 === 0 ? "light" : "dark",
          imageLayout: i % 2 === 0 ? "square" : "roundedPortrait",
        }))
      : [...fallback.tiles];
  return { journalEyebrow, journalTitle, tiles };
}
