import { HOME_FOOTER_FIGMA } from "@/components/marketing/home/home-footer-section-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

/** Matches desktop footer illustration display size — 412px artboard × 0.65 scale. */
export const AUTH_LOGIN_SPHERE_SIZE_PX = Math.round(
  HOME_FOOTER_FIGMA.illustrationSizePx * HOME_FOOTER_FIGMA.illustrationDisplayScale,
);

export const AUTH_LOGIN_SPHERE_COUNT = 15;

export const AUTH_LOGIN_SPHERE_ASSET = HOME_SECTION_ASSETS.footerIllustration;
