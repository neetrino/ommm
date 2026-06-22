/**
 * Figma **Footer** `605:961` — artboard 1440×428.
 * Mobile container `632:1081`.
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
  /** Visual scale vs Figma — tuned on device. */
  illustrationDisplayScale: 0.65,
  /** Keep the sphere inside the footer shell — no bleed below the bottom edge. */
  illustrationBottomInsetPx: 0,
  /** Mobile / tablet — 0 keeps the logo in the footer. */
  illustrationBottomBleedRatio: 0,
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
  contactTitleGapPx: 32,
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

function homeFooterIllustrationTopAtRestPx(
  artboardHeightPx: number,
  displayScale: number,
  bottomInsetPx: number,
): number {
  const scaledHeightPx =
    HOME_FOOTER_FIGMA_POSITIONS.illustration.height * artboardHeightPx * displayScale;
  return artboardHeightPx - bottomInsetPx - scaledHeightPx;
}

function homeFooterContactTitleBottomPx(artboardHeightPx: number): number {
  const contactTopPx =
    HOME_FOOTER_FIGMA_POSITIONS.contact.top * artboardHeightPx - HOME_FOOTER_LAYOUT.contactSocialLiftPx;
  return contactTopPx + HOME_FOOTER_LAYOUT.bodyLineHeightPx;
}

const HOME_FOOTER_FLOAT_PEAK_EXTRA_LIFT_PX = 100;

const HOME_FOOTER_FLOAT_PEAK_MAX_PX = Math.max(
  0,
  Math.round(
    homeFooterIllustrationTopAtRestPx(
      HOME_FOOTER_FIGMA.artboardHeightPx,
      HOME_FOOTER_FIGMA.illustrationDisplayScale,
      HOME_FOOTER_FIGMA.illustrationBottomInsetPx,
    ) -
      homeFooterContactTitleBottomPx(HOME_FOOTER_FIGMA.artboardHeightPx) -
      6 +
      HOME_FOOTER_FLOAT_PEAK_EXTRA_LIFT_PX,
  ),
);

/** Idle float — ball bounce: overshoot at peaks, gravity fall, soft ground rebound. */
export const HOME_FOOTER_FLOAT_MOTION = {
  durationMs: 8200,
  /** Optical gap below the Contact us title at max rise (Figma `605:961`). */
  gapUnderContactTitlePx: 6,
  peakExtraLiftPx: HOME_FOOTER_FLOAT_PEAK_EXTRA_LIFT_PX,
  peakMaxPx: HOME_FOOTER_FLOAT_PEAK_MAX_PX,
  peakHighPx: Math.round(HOME_FOOTER_FLOAT_PEAK_MAX_PX * 0.79),
  peakMidPx: Math.round(HOME_FOOTER_FLOAT_PEAK_MAX_PX * 0.57),
  peakOvershootRatio: 1.035,
  secondaryPeakOvershootRatio: 1.025,
  dipLowPx: 2,
  dipMidPx: 3,
  /** Per-segment easing is set on keyframes; root timing is linear. */
  easing: "linear",
} as const;

/** Figma mobile footer — container `632:1081`. */
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
  navToContactGapPx: 11,
  contactBlockPaddingTopPx: 16,
  contactIconGapPx: 12,
  contactRowGapPx: 14,
  contactTitleToRowsGapPx: 14,
  socialTitleToIconsGapPx: 16,
  socialIconGapPx: 20,
  socialSectionMarginTopPx: 32,
  paymentSectionMarginTopPx: 32,
  legalGapPx: 24,
  legalSectionMarginTopPx: 32,
  copyrightMarginTopPx: 24,
  copyrightFontSizePx: 12,
  copyrightLineHeightPx: 16,
  copyrightLetterSpacingPx: 1.2,
  illustrationTopPx: 56,
  illustrationWidthPx: 400,
  illustrationHeightPx: 396,
  /** Half of the sphere bleeds off the right edge. */
  illustrationHalfVisibleShiftRatio: 0.5,
  paymentGapPx: 16,
  paymentMastercardHeightPx: 22,
  paymentArcaHeightPx: 16,
  paymentVisaHeightPx: 18,
} as const;

/** Mobile layout from Figma `632:1081`. */
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
  navToContactGap: "0.6875rem",
  contactBlockPaddingTop: "1rem",
  contactIconGap: "0.75rem",
  contactRowGap: "0.875rem",
  contactTitleToRowsGap: "0.875rem",
  socialTitleToIconsGap: "1rem",
  socialIconGap: "1.25rem",
  socialSectionMarginTop: "2rem",
  paymentSectionMarginTop: "2rem",
  legalGap: "1.5rem",
  legalSectionMarginTop: "2rem",
  copyrightMarginTop: "1.5rem",
  copyrightFontSize: "0.75rem",
  copyrightLineHeight:
    HOME_FOOTER_SECTION_MOBILE_FIGMA.copyrightLineHeightPx / HOME_FOOTER_SECTION_MOBILE_FIGMA.copyrightFontSizePx,
  copyrightLetterSpacing: "0.075rem",
  illustrationTop: "clamp(2rem, calc(100svw * 56 / 394), 3.5rem)",
  illustrationRight: "0",
  illustrationShiftX: `${HOME_FOOTER_SECTION_MOBILE_FIGMA.illustrationHalfVisibleShiftRatio * 100}%`,
  illustrationWidth: "clamp(15.75rem, calc(100svw * 400 / 394), 25rem)",
  illustrationHeight: "clamp(15.5rem, calc(100svw * 396 / 394), 24.75rem)",
  paymentMarginTop: "2rem",
  paymentGap: `${HOME_FOOTER_SECTION_MOBILE_FIGMA.paymentGapPx}px`,
  paymentMastercardHeight: `${HOME_FOOTER_SECTION_MOBILE_FIGMA.paymentMastercardHeightPx}px`,
  paymentArcaHeight: `${HOME_FOOTER_SECTION_MOBILE_FIGMA.paymentArcaHeightPx}px`,
  paymentVisaHeight: `${HOME_FOOTER_SECTION_MOBILE_FIGMA.paymentVisaHeightPx}px`,
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

/** iPad Mini — centered stacked footer (744px–819px). */
export const HOME_FOOTER_IPAD_MINI_DESKTOP_LAYOUT = {
  shellPaddingTop: "2.5rem",
  shellPaddingBottom: "2rem",
  shellPaddingInline: "1.5rem",
  columnGap: "2rem",
  sectionGap: "1.5rem",
  illustrationMaxRem: 17.5,
  illustrationViewportRatio: 0.38,
  wordmarkFontSizePx: 20,
  wordmarkLineHeightPx: 28,
  wordmarkToNavGapPx: 16,
  bodyFontSizePx: 14,
  bodyLineHeightPx: 20,
  navLinkGapPx: 24,
  legalDividerPaddingTopPx: 24,
  legalLinkGapPx: 24,
  copyrightMarginTopPx: 16,
  paymentMarginTopPx: 32,
  topRadiusPx: 48,
} as const;

/** iPad Air tier — compact desktop footer (820px–1023px). */
export const HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT = {
  shellPaddingTop: "1.75rem",
  shellPaddingBottom: "1.5rem",
  columnGap: "1.25rem",
  rowGap: "0.75rem",
  illustrationColumn: "minmax(7rem, 9.5rem)",
  illustrationMaxRem: 9.5,
  wordmarkFontSizePx: 20,
  wordmarkLineHeightPx: 28,
  bodyFontSizePx: 14,
  bodyLineHeightPx: 20,
  navLinkPaddingLeftPx: 16,
  navLinkGapPx: 8,
  topRadiusPx: 48,
  paymentArcaOffsetPx: 16,
} as const;

/** iPad Pro tier — roomier compact desktop footer (1024px–1366px). */
export const HOME_FOOTER_IPAD_PRO_DESKTOP_LAYOUT = {
  shellPaddingTop: "2.25rem",
  shellPaddingBottom: "1.75rem",
  columnGap: "1.75rem",
  rowGap: "0.875rem",
  illustrationColumn: "minmax(8.5rem, 12rem)",
  illustrationMaxRem: 12,
  wordmarkFontSizePx: 20,
  wordmarkLineHeightPx: 28,
  bodyFontSizePx: 15,
  bodyLineHeightPx: 20,
  navLinkPaddingLeftPx: 24,
  navLinkGapPx: 10,
  topRadiusPx: 56,
  paymentArcaOffsetPx: 20,
} as const;

/** @deprecated Use HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT — CSS vars are tiered in the module. */
export const HOME_FOOTER_TABLET_DESKTOP_LAYOUT = HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT;

/** Full desktop footer — absolute Figma layout (1367px+). */
export const HOME_FOOTER_DESKTOP_MIN_WIDTH_PX = 1367 as const;

/** @deprecated Use HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT — kept for reference values. */
export const HOME_FOOTER_IPAD_AIR_LAYOUT = {
  desktopPadding: "1.75rem 0 1.5rem",
  columnGap: HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT.columnGap,
  rowGap: HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT.rowGap,
  navLinkPaddingLeftPx: HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT.navLinkPaddingLeftPx,
  navToContactSpacerMin: "1rem",
  contactToSocialGap: "1rem",
  navLinkGap: "0.5rem",
  navToContactBlockMarginPx: 48,
  legalCopyrightGap: "0.75rem",
  wordmarkFontSizePx: HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT.wordmarkFontSizePx,
  wordmarkLineHeightPx: HOME_FOOTER_IPAD_AIR_DESKTOP_LAYOUT.wordmarkLineHeightPx,
} as const;

export const HOME_FOOTER_COPYRIGHT_COMPANY_HREF = "https://neetrino.com" as const;
export const HOME_FOOTER_ADDRESS_HREF =
  "https://yandex.com/maps/10262/yerevan/house/pushkini_poghots_25/YE0YcwZiTkYCQFpqfX15c31qYw==/?ll=44.512935%2C40.182167&z=20.44" as const;

export const HOME_FOOTER_LEGAL_LINKS = [
  { href: "/contact", labelKey: "footerPrivacy" },
  { href: "/contact", labelKey: "footerTerms" },
  { href: "/refund", labelKey: "footerRefund" },
] as const;

/** Figma `605:1002` — Instagram only. */
export const HOME_FOOTER_SOCIAL_LINKS = [
  {
    id: "instagram",
    href: "https://www.instagram.com/ommm.space/",
    asset: HOME_SECTION_ASSETS.footerSocialInstagram,
    width: 23,
    height: 23,
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
  mail: HOME_SECTION_ASSETS.footerIconMail,
  location: HOME_SECTION_ASSETS.footerIconLocation,
} as const;
