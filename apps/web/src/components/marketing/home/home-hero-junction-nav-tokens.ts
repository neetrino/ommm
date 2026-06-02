import { HOME_HERO_FIGMA } from "@/components/marketing/home/home-hero-banner-tokens";
import {
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

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

/** Optical nudge — junction controls on mobile (negative = higher on screen). */
const junctionNavMobileLowerNudgePx = -10;

export const HOME_HERO_JUNCTION_NAV_LAYOUT = {
  buttonSize: "clamp(2.125rem, calc(100svw * 54 / 1440), 3.375rem)",
  buttonGap: "clamp(0.625rem, calc(100svw * 16 / 1440), 1rem)",
  /**
   * Weekly schedule panel top sits sectionTopGap above the hero frame bottom.
   * Center the control pair on that seam — half on hero, half on block 2.
   */
  bottomOffset: `calc(${HOME_WEEKLY_SCHEDULE_LAYOUT.sectionTopGap} - var(--home-hero-junction-button-size) / 2)`,
} as const;

export const HOME_HERO_JUNCTION_NAV_MOBILE_LAYOUT = {
  /** Slightly above Figma `196:1455` scale on artboard `394`. */
  buttonSize: "clamp(2.5rem, calc(100svw * 62 / 394), 3.875rem)",
  buttonGap: "clamp(0.625rem, calc(100svw * 14 / 394), 0.875rem)",
  bottomOffset: `calc(${HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionTopGap} - var(--home-hero-junction-button-size) / 2 - ${junctionNavMobileLowerNudgePx}px)`,
} as const;
