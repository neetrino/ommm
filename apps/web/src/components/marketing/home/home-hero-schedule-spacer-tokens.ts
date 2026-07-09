import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

/** Symmetric inset above and below the Presale packages title — not schedule’s +56px title band. */
const presaleTitleVerticalInset = HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelPaddingY;

/** Desktop symmetric inset above/below Presale packages title — extra room vs mobile `3rem`. */
const presaleTitleVerticalInsetDesktopBase = "clamp(1.5rem, 5vw, 3rem)";
const presaleTitleVerticalInsetDesktopExtraPx = 80;
const presaleTitleVerticalInsetLg = `calc(${presaleTitleVerticalInsetDesktopBase} + ${presaleTitleVerticalInsetDesktopExtraPx}px)`;

/** Presale panel between hero video and Weekly Schedule — shares schedule panel shell tokens. */
export const HOME_HERO_SCHEDULE_SPACER_LAYOUT = {
  sectionPaddingX: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
  sectionHeroOverlap: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionHeroOverlap,
  sectionHeroOverlapLg: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionHeroOverlap,
  sectionPanelTopInset: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPanelTopInset,
  sectionPanelTopInsetLg: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPanelTopInset,
  sectionBottomGap: "0px",
  panelPaddingTop: presaleTitleVerticalInset,
  panelPaddingTopLg: presaleTitleVerticalInsetLg,
  panelPaddingBottom: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelPaddingY,
  panelPaddingBottomLg: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPaddingBottom,
  titleToContentGap: presaleTitleVerticalInset,
  titleToContentGapLg: presaleTitleVerticalInsetLg,
} as const;
