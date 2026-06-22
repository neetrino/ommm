/**
 * Figma **Footer** `605:961` — artboard 1440×428.
 * Mobile container `97:5944`.
 */

import { MARKETING_CONTENT_INLINE_INSET } from "@/components/marketing/marketing-content-layout";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

const HOME_FOOTER_OLIVE_RGB = "151, 144, 124";
const HOME_FOOTER_CREAM_RGB = "251, 245, 213";

/** Figma `605:961` — subtle olive → cream wash on page cream. */
export const HOME_FOOTER_SHELL_BACKGROUND = `linear-gradient(to bottom, rgba(${HOME_FOOTER_OLIVE_RGB}, 0.09) 0%, rgba(${HOME_FOOTER_CREAM_RGB}, 0.09) 100%), ${HOME_PAGE_SURFACE.pageBackground}`;

export const HOME_FOOTER_FIGMA = {
  surface: HOME_PAGE_SURFACE.pageBackground,
  wrapBackground: HOME_PAGE_SURFACE.pageBackground,
  shellBackground: HOME_FOOTER_SHELL_BACKGROUND,
  topRadiusPx: 64,
  text: "#97907c",
  artboardWidthPx: 1440,
  artboardHeightPx: 428,
  illustrationSizePx: 412,
  paymentGapPx: 16,
  paymentLogoHeightPx: 28,
  paymentArcaDisplayHeightPx: 20,
  paymentArcaOffsetXPx: 24,
  paymentMastercardWidthPx: 35,
  paymentMastercardHeightPx: 28,
  paymentArcaWidthPx: 78,
  paymentArcaHeightPx: 20,
  paymentVisaWidthPx: 63,
  paymentVisaHeightPx: 22,
} as const;

/** Positions from Figma `605:961` metadata — percentages of artboard width/height. */
export const HOME_FOOTER_FIGMA_POSITIONS = {
  topBar: { left: 71 / 1440, top: 81 / 428 },
  illustration: {
    left: 515 / 1440,
    width: 412 / 1440,
    height: 412 / 428,
    /** Sphere bottom extends 147px below the 428px artboard — clipped by footer shell. */
    bottomOverflow: (163 + 412 - 428) / 428,
  },
  contact: { left: 71 / 1440, top: 163 / 428 },
  payment: { left: 74 / 1440, top: 358 / 428 },
  social: { left: 1132 / 1440, top: 183 / 428 },
  legal: { left: 1166 / 1440, top: 299 / 428 },
  copyright: {
    /** Line 2 ~10px below payment row top (347px block top on 428px artboard). */
    top: (358 - 21 + 10) / 428,
    width: 291 / 1440,
  },
} as const;

export const HOME_FOOTER_LAYOUT = {
  maxWidthPx: HOME_FOOTER_FIGMA.artboardWidthPx,
  minHeightPx: HOME_FOOTER_FIGMA.artboardHeightPx,
  sectionPaddingTop: "clamp(1rem, 2.5vw, 2.5rem)",
  navLinkPaddingLeftPx: 48,
  navLinkGapPx: 10,
  contactSectionGapPx: 21,
  contactRowGapPx: 19,
  socialTitleGapPx: 22,
  socialIconGapPx: 22,
  legalLinkGapPx: 34,
  wordmarkFontSizePx: 20,
  wordmarkLineHeightPx: 28,
  bodyFontSizePx: 16,
  bodyLineHeightPx: 20,
  bodyLetterSpacingPx: -0.35,
  copyrightFontSizePx: 14,
  copyrightLineHeightPx: 21,
  copyrightLetterSpacingPx: 2.4,
  /** Contact Us + Social Media — shift up from Figma baseline. */
  contactSocialLiftPx: 20,
  /** Top nav + legal links — shift up from Figma baseline. */
  topBarLegalLiftPx: 10,
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
  paymentMarginTopPx: 24,
  paymentGapPx: 16,
} as const;

/** Mobile layout from Figma `97:5944`. */
export const HOME_FOOTER_MOBILE_LAYOUT = {
  galleryOverlap: "2.5rem",
  wrapPaddingTop: "2.5rem",
  sectionPaddingX: "1rem",
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
  paymentMarginTop: "1.5rem",
  paymentGap: `${HOME_FOOTER_SECTION_MOBILE_FIGMA.paymentGapPx}px`,
} as const;

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
  { href: "/refund", labelKey: "footerRefund" },
] as const;

/** Figma `605:1002` — Facebook → Instagram → Telegram → YouTube → WhatsApp → Viber. */
export const HOME_FOOTER_SOCIAL_LINKS = [
  {
    id: "facebook",
    href: "https://facebook.com",
    asset: HOME_SECTION_ASSETS.footerSocialFacebook,
    width: 13,
    height: 23,
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/ommm.space/",
    asset: HOME_SECTION_ASSETS.footerSocialInstagram,
    width: 23,
    height: 23,
  },
  {
    id: "telegram",
    href: "https://t.me",
    asset: HOME_SECTION_ASSETS.footerSocialTelegram,
    width: 24,
    height: 24,
  },
  {
    id: "youtube",
    href: "https://youtube.com",
    asset: HOME_SECTION_ASSETS.footerSocialYoutube,
    width: 25,
    height: 18,
  },
  {
    id: "whatsapp",
    href: "https://wa.me",
    asset: HOME_SECTION_ASSETS.footerSocialWhatsapp,
    width: 24,
    height: 24,
  },
  {
    id: "viber",
    href: "https://viber.com",
    asset: HOME_SECTION_ASSETS.footerSocialViber,
    width: 22,
    height: 24,
  },
] as const;

export const HOME_FOOTER_PAYMENT_LOGOS = [
  {
    id: "mastercard",
    src: HOME_SECTION_ASSETS.footerPaymentMastercard,
  },
  {
    id: "arca",
    src: HOME_SECTION_ASSETS.footerPaymentArca,
  },
  {
    id: "visa",
    src: HOME_SECTION_ASSETS.footerPaymentVisa,
  },
] as const;

export const HOME_FOOTER_ASSETS = {
  illustration: HOME_SECTION_ASSETS.footerIllustration,
  phone: HOME_SECTION_ASSETS.footerIconPhone,
  mail: HOME_SECTION_ASSETS.footerIconMail,
  location: HOME_SECTION_ASSETS.footerIconLocation,
} as const;
