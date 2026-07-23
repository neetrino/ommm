/**
 * Policy pages (privacy, terms, refund) — cream band + gallery typography
 * (Figma Gallery `605:932` / “A Sanctuary for Every Body”).
 */

import { HOME_GALLERY_FIGMA } from "@/components/marketing/home/home-gallery-section-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";

export const POLICY_PAGE_SURFACE = {
  background: HOME_PAGE_SURFACE.pageBackground,
  heading: HOME_GALLERY_FIGMA.headingColor,
  lead: HOME_GALLERY_FIGMA.subtitleColor,
} as const;
