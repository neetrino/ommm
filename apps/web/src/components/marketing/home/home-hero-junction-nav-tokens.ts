import { HOME_HERO_FIGMA } from "@/components/marketing/home/home-hero-banner-tokens";
import { HOME_WEEKLY_SCHEDULE_LAYOUT } from "@/components/marketing/home/home-weekly-schedule-tokens";

/** Figma hero junction nav `196:1455` — artboard 1440×924; rendered slightly smaller than export. */
export const HOME_HERO_JUNCTION_NAV_FIGMA = {
  artboardWidthPx: HOME_HERO_FIGMA.artboardWidthPx,
  buttonSizePx: 54,
  buttonGapPx: 16,
  buttonFill: "#ffffff",
} as const;

export const HOME_HERO_JUNCTION_NAV_ASSETS = {
  arrow: "/marketing/home/hero/home-hero-junction-nav-arrow.svg",
} as const;

export const HOME_HERO_JUNCTION_NAV_LAYOUT = {
  buttonSize: "clamp(2.125rem, calc(100svw * 54 / 1440), 3.375rem)",
  buttonGap: "clamp(0.625rem, calc(100svw * 16 / 1440), 1rem)",
  /**
   * Weekly schedule panel top sits sectionTopGap above the hero frame bottom.
   * Center the control pair on that seam — half on hero, half on block 2.
   */
  bottomOffset: `calc(${HOME_WEEKLY_SCHEDULE_LAYOUT.sectionTopGap} - var(--home-hero-junction-button-size) / 2)`,
} as const;
