import {
  createDefaultHomePageSectionVisibility,
  filterMarketingNavLinks,
  type HomePageSectionVisibility,
  type MarketingNavLinkDefinition,
} from "@/lib/home-page-sections";
import { fetchPublicStudioCached } from "@/lib/fetch-public-studio";

export async function getHomeSectionsVisibility(): Promise<HomePageSectionVisibility> {
  const res = await fetchPublicStudioCached();
  if (!res.ok) {
    return createDefaultHomePageSectionVisibility();
  }

  return res.data.homeSectionsVisibility ?? createDefaultHomePageSectionVisibility();
}

export async function getFilteredMarketingNavLinks(): Promise<MarketingNavLinkDefinition[]> {
  const visibility = await getHomeSectionsVisibility();
  return filterMarketingNavLinks(visibility);
}
