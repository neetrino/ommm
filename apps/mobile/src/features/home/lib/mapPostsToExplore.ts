import type { ContentPostRow } from "../../../lib/api/memberClient";
import type { ExploreTileMock } from "../../../lib/mocks/homeMock";
import { homeMock } from "../../../lib/mocks/homeMock";

function typeToTag(type: string): string {
  return type.replace(/_/g, " ").slice(0, 18).toUpperCase();
}

export function postsToExploreContent(posts: ContentPostRow[]): {
  journalEyebrow: string;
  journalTitle: string;
  tiles: ExploreTileMock[];
} {
  if (posts.length === 0) {
    return {
      journalEyebrow: homeMock.explore.journalEyebrow,
      journalTitle: homeMock.explore.journalTitle,
      tiles: [...homeMock.explore.tiles],
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
      : [...homeMock.explore.tiles];
  return { journalEyebrow, journalTitle, tiles };
}
