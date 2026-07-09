import { cache } from "react";
import {
  createDefaultHomePageSectionVisibility,
  filterMarketingNavLinks,
  normalizeHomePageSectionVisibility,
  type HomePageSectionVisibility,
  type MarketingNavLinkDefinition,
} from "@/lib/home-page-sections";
import { serverApiJsonPublic } from "@/lib/server-api";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";

type HomeSectionsResponse = {
  sections: HomePageSectionVisibility;
};

/** Tagged visibility read — busted via `revalidatePublicStudio` after admin home-section edits. */
async function fetchHomeSectionsVisibilityCached(): Promise<HomePageSectionVisibility> {
  const res = await serverApiJsonPublic<HomeSectionsResponse>("/studio/home-sections", {
    tags: [PUBLIC_CACHE_TAGS.homeSections],
  });
  if (!res.ok) {
    return createDefaultHomePageSectionVisibility();
  }

  return normalizeHomePageSectionVisibility(
    res.data.sections ?? createDefaultHomePageSectionVisibility(),
  );
}

/** Deduped per request; tagged cache with admin invalidation. */
export const getHomeSectionsVisibility = cache(fetchHomeSectionsVisibilityCached);

export async function getFilteredMarketingNavLinks(): Promise<MarketingNavLinkDefinition[]> {
  const visibility = await getHomeSectionsVisibility();
  return filterMarketingNavLinks(visibility);
}
