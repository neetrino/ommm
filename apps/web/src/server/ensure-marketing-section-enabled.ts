import { notFound } from "next/navigation";
import {
  isHomeSectionEnabled,
  type HomePageSectionKey,
} from "@/lib/home-page-sections";
import { getHomeSectionsVisibility } from "@/server/home-sections-visibility";

/** Returns 404 when a marketing section is disabled in admin settings. */
export async function ensureMarketingSectionEnabled(
  sectionKey: HomePageSectionKey,
): Promise<void> {
  const visibility = await getHomeSectionsVisibility();
  if (!isHomeSectionEnabled(visibility, sectionKey)) {
    notFound();
  }
}
