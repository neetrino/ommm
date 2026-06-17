/**
 * Figma **Footer** `196:1191` — artboard 1440×635.
 * Mobile container `97:5944`.
 */

import { MARKETING_CONTENT_INLINE_INSET } from "@/components/marketing/marketing-content-layout";
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

/** Figma mobile footer — container `97:5944`. */
export const HOME_FOOTER_SECTION_MOBILE_FIGMA = {
  artboardWidthPx: 394,
  sectionPaddingXPx: 24,
  sectionPaddingTopPx: 48,
  sectionPaddingBottomPx: 24,
  topRadiusPx: 40,
  wordmarkFontSizePx: 20,
  wordmarkLineHeightPx: 28,
  bodyFontSizePx: 14,
  bodyLineHeightPx: 20,
  navGapPx: 10,
  wordmarkToNavGapPx: 16,
  contactIconGapPx: 12,
  contactRowGapPx: 12,
  contactSectionMarginTopPx: 16,
  socialTitleToIconsGapPx: 16,
  socialIconGapPx: 20,
  socialSectionMarginTopPx: 32,
  legalGapPx: 24,
  legalSectionMarginTopPx: 32,
  copyrightMarginTopPx: 24,
  copyrightFontSizePx: 12,
  copyrightLineHeightPx: 16,
  copyrightLetterSpacingPx: 1.2,
  illustrationTopPx: 14,
  illustrationLeftPx: 70,
  illustrationWidthPx: 400,
  illustrationHeightPx: 396,
} as const;

/** Mobile layout from Figma `97:5944`. */
export const HOME_FOOTER_MOBILE_LAYOUT = {
  galleryOverlap: "2.5rem",
  wrapPaddingTop: "2.5rem",
  sectionPaddingX: "1.5rem",
  sectionPaddingTop: "3rem",
  sectionPaddingBottom: "1.5rem",
  topRadius: "2.5rem",
  wordmarkFontSize: "1.25rem",
  wordmarkLineHeight:
    HOME_FOOTER_SECTION_MOBILE_FIGMA.wordmarkLineHeightPx / HOME_FOOTER_SECTION_MOBILE_FIGMA.wordmarkFontSizePx,
  bodyFontSize: "0.875rem",
  bodyLineHeight:
    HOME_FOOTER_SECTION_MOBILE_FIGMA.bodyLineHeightPx / HOME_FOOTER_SECTION_MOBILE_FIGMA.bodyFontSizePx,
  navGap: "0.625rem",
  wordmarkToNavGap: "1rem",
  contactIconGap: "0.75rem",
  contactRowGap: "0.75rem",
  contactSectionMarginTop: "1rem",
  socialTitleToIconsGap: "1rem",
  socialIconGap: "1.25rem",
  socialSectionMarginTop: "2rem",
  legalGap: "1.5rem",
  legalSectionMarginTop: "2rem",
  copyrightMarginTop: "1.5rem",
  copyrightFontSize: "0.75rem",
  copyrightLineHeight:
    HOME_FOOTER_SECTION_MOBILE_FIGMA.copyrightLineHeightPx / HOME_FOOTER_SECTION_MOBILE_FIGMA.copyrightFontSizePx,
  copyrightLetterSpacing: "0.075rem",
  illustrationTop: "clamp(-2.125rem, calc(100svw * -34 / 394), -2.125rem)",
  illustrationLeft: "clamp(3.25rem, calc(100svw * 70 / 394), 4.375rem)",
  illustrationWidth: "clamp(15.75rem, calc(100svw * 400 / 394), 25rem)",
  illustrationHeight: "clamp(15.5rem, calc(100svw * 396 / 394), 24.75rem)",
  heroMinHeight: "clamp(11rem, calc(100svw * 267 / 394), 16.75rem)",
} as const;

/** Pull teal through rounded footer cap corners — same idea as Our Core Practices / schedule join. */
const homeFooterTabletCornerCoverPx = HOME_FOOTER_SECTION_MOBILE_FIGMA.topRadiusPx + 12;

/** iPad Air + Pro — footer cap + gallery underlap (744px–1366px). */
export const HOME_FOOTER_TABLET_LAYOUT = {
  galleryOverlap: `calc(${HOME_FOOTER_MOBILE_LAYOUT.galleryOverlap} + ${homeFooterTabletCornerCoverPx}px)`,
  wrapPaddingTop: `calc(${HOME_FOOTER_MOBILE_LAYOUT.galleryOverlap} + ${homeFooterTabletCornerCoverPx}px)`,
} as const;

/** Inner marketing routes — gradient continues behind footer (no gallery underlap). */
export const HOME_FOOTER_INNER_TABLET_LAYOUT = {
  galleryOverlap: "0",
  wrapPaddingTop: HOME_FOOTER_LAYOUT.sectionPaddingTop,
} as const;

/** Inner routes — match header/page horizontal inset (`ommm-container`). */
export const HOME_FOOTER_INNER_MOBILE_LAYOUT = {
  ...HOME_FOOTER_MOBILE_LAYOUT,
  sectionPaddingX: MARKETING_CONTENT_INLINE_INSET,
} as const;

export type HomeFooterSurfaceVariant = "home" | "inner";

/** iPad Air — footer grid; Contact us block sits under Explore (744px–1023px). */
export const HOME_FOOTER_IPAD_AIR_LAYOUT = {
  desktopPadding: "2rem 1.5rem 1.5rem",
  columnGap: "1.5rem",
  rowGap: "0.75rem",
  navLinkPaddingLeftPx: 0,
  /** Flex spacer between nav and Contact us block. */
  navToContactSpacerMin: "1rem",
  contactToSocialGap: "1rem",
  navLinkGap: "0.5rem",
  navToContactBlockMarginPx: 48,
  legalCopyrightGap: "0.75rem",
  wordmarkFontSizePx: 36,
  wordmarkLineHeightPx: 40,
} as const;

export const HOME_FOOTER_COPYRIGHT_COMPANY_HREF = "https://neetrino.com" as const;
export const HOME_FOOTER_ADDRESS_HREF =
  "https://yandex.com/maps/10262/yerevan/house/pushkini_poghots_25/YE0YcwZiTkYCQFpqfX15c31qYw==/?ll=44.512935%2C40.182167&z=20.44" as const;

export const HOME_FOOTER_LEGAL_LINKS = [
  { href: "/contact", labelKey: "footerPrivacy" },
  { href: "/contact", labelKey: "footerTerms" },
  { href: "/contact", labelKey: "footerRefund" },
] as const;

export const HOME_FOOTER_SOCIAL_LINKS = [
  { id: "facebook", href: "https://facebook.com", asset: HOME_SECTION_ASSETS.footerSocialFacebook, width: 13, height: 23 },
  {
    id: "instagram",
    href: "https://www.instagram.com/ommm.space/",
    asset: HOME_SECTION_ASSETS.footerSocialInstagram,
    width: 23,
    height: 23,
  },
  { id: "telegram", href: "https://t.me", asset: HOME_SECTION_ASSETS.footerSocialTelegram, width: 24, height: 24 },
  { id: "youtube", href: "https://youtube.com", asset: HOME_SECTION_ASSETS.footerSocialYoutube, width: 25, height: 18 },
  { id: "whatsapp", href: "https://wa.me", asset: HOME_SECTION_ASSETS.footerSocialWhatsapp, width: 24, height: 24 },
  { id: "threads", href: "https://www.threads.net/@ommm.space", asset: HOME_SECTION_ASSETS.footerSocialThreads, width: 23, height: 23 },
] as const;

export const HOME_FOOTER_ASSETS = {
  illustration: HOME_SECTION_ASSETS.footerIllustration,
  phone: HOME_SECTION_ASSETS.footerIconPhone,
  mail: HOME_SECTION_ASSETS.footerIconMail,
  location: HOME_SECTION_ASSETS.footerIconLocation,
} as const;
