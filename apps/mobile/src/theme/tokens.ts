import { Platform, StyleSheet } from "react-native";

/**
 * Design tokens derived from Figma (Ommm. Space — home 4, node 1:125).
 * Single source of truth for colors, spacing, radii, and shadows.
 */
export const colors = {
  canvas: "#faf9f7",
  primaryGreen: "#334537",
  primaryGreen80: "rgba(51,69,55,0.8)",
  secondarySage: "#434843",
  warmBrown: "#6b5c4c",
  taupe: "#a19685",
  taupeButton: "#988e7e",
  taupeNavEnd: "#3b3731",
  creamHighlight: "#fffec9",
  cardTint: "rgba(244,223,203,0.3)",
  badgeCream: "#f4dfcb",
  glassBorder: "rgba(255,255,255,0.5)",
  overlayWhite38: "rgba(255,255,255,0.38)",
  overlayWhite35: "rgba(255,255,255,0.35)",
  overlayWhite40: "rgba(255,255,255,0.4)",
  overlayWhite20: "rgba(255,255,255,0.2)",
  /** Lighter frosted tint (e.g. Next class details glass). */
  overlayWhite14: "rgba(255,255,255,0.14)",
  overlayWhite10: "rgba(255,255,255,0.1)",
  /** Extra-light glass base tint (read with BlurView + specular gradient). */
  overlayWhite08: "rgba(255,255,255,0.08)",
  /** Specular highlight for frosted “Next class” details glass. */
  detailsGlassSheenStrong: "rgba(255,255,255,0.34)",
  detailsGlassSheenSoft: "rgba(255,255,255,0.06)",
  overlayBlack08: "rgba(0,0,0,0.08)",
  overlayGreen20: "rgba(51,69,55,0.2)",
  studioPill: "rgba(19,19,19,0.9)",
  exploreTitle: "#2e2e2e",
  tileTitle: "#2d2d2d",
  ink: "#1a1c1b",
  bodyMuted: "rgba(67,72,67,0.7)",
  bodyMutedOnDark: "rgba(213,213,213,0.7)",
  white: "#ffffff",
  /** Gift card subtitle on green overlay — Figma node 1:214 */
  white90: "rgba(255,255,255,0.9)",
  black: "#0a0a0a",
  watermark: "rgba(51,69,55,0.05)",
  giftGradientStart: "#e8da74",
  giftGradientEnd: "rgba(246,255,208,0)",
  statusGradientStart: "#fff39b",
  statusGradientEnd: "#b6e8ff",
  scrimDark: "rgba(0,0,0,0.25)",
  danger: "#8b2e2e",
} as const;

export const gradients = {
  screen: {
    colors: ["#eef0cd", "#faffa0", "#ffe4c3", "#e4f5fd", "#eef0cd"] as const,
    locations: [0, 0.23, 0.31, 0.68, 0.97] as const,
    start: { x: 0.15, y: 0 },
    end: { x: 0.85, y: 1 },
  },
  navBar: {
    colors: ["#a19685", "#3b3731"] as const,
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1.2 },
  },
  playButton: {
    colors: ["#827a6c", "#1c1a17"] as const,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1.5 },
  },
} as const;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  section: 24,
  screenHorizontal: 24,
} as const;

export const radii = {
  header: 40,
  card: 48,
  /** Next-class frosted details panel — matches design (45px). */
  detailsGlass: 45,
  cardInner: 47,
  banner: 64,
  pill: 9999,
  waitTopLeft: 64,
  waitTopRight: 24,
  labelCard: 24,
  logo: 62.5,
} as const;

export const layout = {
  designWidth: 390,
  headerMinHeight: 116,
  tabBarHeight: 80,
  bookingCardHeight: 256,
  avatarSize: 56,
} as const;

/**
 * Gift card promo overlay — Figma node 1:210 (`Overlay`), frame 342×256.5 on 390pt artboard.
 */
export const giftCard = {
  minHeight: 307.62,
  badgeSize: 128,
  /** Relative to wrap top (= card top). Small overhang keeps top area tight. */
  badgeTop: -10,
  /** Badge bottom (−10 + 128) + 10 px gap — Figma rhythm, shifted up */
  titleTopOffset: 128,
  /** Heading bottom y+h → subtitle frame y */
  subtitleMarginTop: 7,
  subtitleMaxWidth: 246,
  subtitleInnerPaddingHorizontal: 2.53,
  subtitleMinHeight: 50,
  ctaMarginTop: 20,
  ctaPaddingHorizontal: 40,
  ctaPaddingVertical: 16,
  ctaBorderRadius: 60,
  ctaMinHeight: 56,
  /** Manrope uppercase label — matches Dev Mode tracking */
  ctaLetterSpacing: 1.6,
  /** `(342 − 246) / 2` — aligns `Container` x=48 with frame width 342 */
  overlayPaddingHorizontal: 48,
  /** Frame height − button bottom — keeps Figma vertical rhythm */
  overlayPaddingBottom: 26.62,
} as const;

/**
 * Explore secondary tiles (Figma: 1:191 Spring in Tuscany, 1:199 Enhanced Protocols).
 * Horizontal layout reference width = 163pt (two columns on 390pt artboard).
 */
export const exploreTile = {
  baseWidth: 163,
  /** Corner radius matches `radii.card` (48) — Figma `rounded-[48px]` on both tiles. */
  retreatBadgeOffsetX: 48,
  retreatBadgeOffsetY: 10.875,
  pilatesBadgeOffsetY: 9.875,
  pilatesClipHeight: 203.75,
  pilatesImageOffsetX: -11,
  pilatesImageOffsetY: -10.125,
  pilatesImageWidth: 163,
  pilatesImageHeight: 237,
  springColumnPaddingBottom: 64.75,
  enhancedColumnPaddingTop: 24,
  imageTitleGap: 12,
  tagPaddingHorizontal: 12,
  tagPaddingVertical: 4,
} as const;

export const typography = {
  welcome: 16,
  sectionTitle: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  micro: 10,
  watermark: 96,
  bookCta: 14,
} as const;

export const shadows = StyleSheet.create({
  bookingCard: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.04,
      shadowRadius: 5,
    },
    android: { elevation: 6 },
    default: {},
  }),
  exploreHero: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
    },
    android: { elevation: 12 },
    default: {},
  }),
  tabBar: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: { elevation: 16 },
    default: {},
  }),
});
