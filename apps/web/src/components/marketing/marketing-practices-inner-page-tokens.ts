import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { STORY_PAGE_LAYOUT } from "@/components/marketing/story/story-page-tokens";

/** Schedule, Packages, Contact — cream surface + Our Values hero ink. */
export const MARKETING_PRACTICES_INNER_PAGE_SURFACE = {
  background: HOME_PAGE_SURFACE.classesGradientTo,
  heading: STORY_PAGE_LAYOUT.valuesHeadingColor,
  lead: STORY_PAGE_LAYOUT.valuesSubtitleColor,
} as const;
