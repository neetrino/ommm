import { cache } from "react";
import {
  createDefaultHomePageSectionVisibility,
  filterMarketingNavLinks,
  type HomePageSectionVisibility,
  type MarketingNavLinkDefinition,
} from "@/lib/home-page-sections";
import { serverApiJsonPublic } from "@/lib/server-api";

type HomeSectionsResponse = {
  sections: HomePageSectionVisibility;
};

/** Fresh visibility read for route guards — no Next/Redis cache staleness. */
async function fetchHomeSectionsVisibilityFresh(): Promise<HomePageSectionVisibility> {
  const res = await serverApiJsonPublic<HomeSectionsResponse>("/studio/home-sections", {
    cacheMode: "no-store",
  });
  if (!res.ok) {
    return createDefaultHomePageSectionVisibility();
  }

  return res.data.sections ?? createDefaultHomePageSectionVisibility();
}

/** Deduped per request; always no-store upstream (API reads DB directly). */
export const getHomeSectionsVisibility = cache(fetchHomeSectionsVisibilityFresh);

export async function getFilteredMarketingNavLinks(): Promise<MarketingNavLinkDefinition[]> {
  const visibility = await getHomeSectionsVisibility();
  return filterMarketingNavLinks(visibility);
}
