/**
 * Figma **Footer** `196:1191` — artboard 1440×635.
 */

import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

export const HOME_FOOTER_FIGMA = {
  surface: HOME_PAGE_SURFACE.pageBackground,
  /** Same rounded cap as Packages panel `196:1251`. */
  wrapBackground: HOME_PAGE_SURFACE.eventsGradientFrom,
  topRadiusPx: HOME_PAGE_SURFACE.plansPanelRadiusPx,
  text: "#97907c",
  artboardWidthPx: 1440,
  artboardHeightPx: 635,
  illustrationWidthPx: 596,
  illustrationHeightPx: 471,
} as const;

/** Positions from Figma metadata — percentages of artboard width/height. */
export const HOME_FOOTER_FIGMA_POSITIONS = {
  wordmark: { left: 69 / 1440, top: 65 / 635 },
  nav: { left: 372 / 1440, top: 65 / 635 },
  illustration: { left: 422 / 1440, top: 138 / 635, width: 596 / 1440, height: 471 / 635 },
  contact: { left: 66 / 1440, top: 304 / 635 },
  social: { left: 71 / 1440, top: 517 / 635 },
  legal: { left: 1051 / 1440, top: 499 / 635 },
  copyright: { left: 1051 / 1440, top: 548 / 635, width: 330 / 1440 },
} as const;

export const HOME_FOOTER_LAYOUT = {
  maxWidthPx: HOME_FOOTER_FIGMA.artboardWidthPx,
  minHeightPx: HOME_FOOTER_FIGMA.artboardHeightPx,
  sectionPaddingTop: "clamp(1rem, 2.5vw, 2.5rem)",
  navLinkPaddingLeftPx: 48,
  navLinkGapPx: 10,
  contactSectionGapPx: 21,
  contactRowGapPx: 18,
  socialTitleGapPx: 22,
  socialIconGapPx: 22,
  legalLinkGapPx: 26,
  wordmarkFontSizePx: 20,
  wordmarkLineHeightPx: 28,
  bodyFontSizePx: 16,
  bodyLineHeightPx: 20,
  bodyLetterSpacingPx: -0.35,
  copyrightFontSizePx: 14,
  copyrightLineHeightPx: 21,
  copyrightLetterSpacingPx: 2.4,
} as const;

/** Top nav — Figma `196:1196`. Labels from `nav` namespace. */
export const HOME_FOOTER_NAV_LINKS = [
  { href: "/story", navKey: "story" },
  { href: "/schedule", navKey: "schedule" },
  { href: "/coaches", navKey: "coaches" },
  { href: "/packages", navKey: "memberships" },
  { href: "/explore", navKey: "explore" },
  { href: "/contact", navKey: "contact" },
] as const;

export const HOME_FOOTER_COPYRIGHT_COMPANY_HREF = "https://neetrino.com" as const;

export const HOME_FOOTER_LEGAL_LINKS = [
  { href: "/contact", labelKey: "footerPrivacy" },
  { href: "/contact", labelKey: "footerTerms" },
  { href: "/contact", labelKey: "footerRefund" },
] as const;

export const HOME_FOOTER_SOCIAL_LINKS = [
  { id: "facebook", href: "https://facebook.com", asset: HOME_SECTION_ASSETS.footerSocialFacebook, width: 13, height: 23 },
  { id: "instagram", href: "https://instagram.com", asset: HOME_SECTION_ASSETS.footerSocialInstagram, width: 23, height: 23 },
  { id: "telegram", href: "https://t.me", asset: HOME_SECTION_ASSETS.footerSocialTelegram, width: 24, height: 24 },
  { id: "youtube", href: "https://youtube.com", asset: HOME_SECTION_ASSETS.footerSocialYoutube, width: 25, height: 18 },
  { id: "whatsapp", href: "https://wa.me", asset: HOME_SECTION_ASSETS.footerSocialWhatsapp, width: 24, height: 24 },
  { id: "viber", href: "viber://chat", asset: HOME_SECTION_ASSETS.footerSocialViber, width: 22, height: 24 },
] as const;

export const HOME_FOOTER_ASSETS = {
  illustration: HOME_SECTION_ASSETS.footerIllustration,
  phone: HOME_SECTION_ASSETS.footerIconPhone,
  mail: HOME_SECTION_ASSETS.footerIconMail,
  location: HOME_SECTION_ASSETS.footerIconLocation,
} as const;
