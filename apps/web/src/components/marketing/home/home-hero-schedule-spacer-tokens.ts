import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

/** Presale panel between hero video and Weekly Schedule — shares schedule panel shell tokens. */
export const HOME_HERO_SCHEDULE_SPACER_LAYOUT = {
  sectionPaddingX: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
  sectionHeroOverlap: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionHeroOverlap,
  sectionHeroOverlapLg: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionHeroOverlap,
  sectionPanelTopInset: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPanelTopInset,
  sectionPanelTopInsetLg: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPanelTopInset,
  sectionBottomGap: "0px",
} as const;

/** Matches weekly schedule loading shell — keeps presale panel height aligned with schedule. */
export const HOME_PRESALE_PACKAGES_PANEL_MIN_HEIGHT = "clamp(22rem,55vw,36rem)";
