import { HOME_HERO_FIGMA } from "@/components/marketing/home/home-hero-banner-tokens";

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

/** Junction nav layout — applied in `home-hero-junction-nav.module.css` (not inline styles). */
