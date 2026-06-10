/** Contact page — layout and surface tokens aligned with schedule `ommm-card`. */

export const CONTACT_PAGE_CARD_SHELL_CLASS =
  "ommm-card shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)]";

export const CONTACT_PAGE_SURFACE = {
  calloutBackground: "rgba(255, 255, 255, 0.42)",
  headingColor: "#1d1c15",
  labelColor: "#4a4738",
  valueColor: "#1d1c15",
  inputBackground: "rgba(255, 255, 255, 0.75)",
  inputBorder: "rgba(151, 144, 124, 0.35)",
  inputErrorBorder: "#b42318",
  inputErrorRing: "rgba(180, 35, 24, 0.12)",
  buttonBackground: "#a68f7b",
  buttonHoverBackground: "#8f7968",
  securityTextColor: "#4a4738",
  iconBackground: "rgba(255, 255, 255, 0.85)",
} as const;

export const CONTACT_PAGE_LAYOUT = {
  cardRadiusPx: 28,
  cardPaddingPx: 36,
  cardGapPx: 28,
  iconSizePx: 56,
  socialIconSizePx: 36,
  inputRadiusPx: 12,
  buttonRadiusPx: 999,
  calloutRadiusPx: 16,
  successToastTopGapPx: 12,
  successToastVisibleMs: 3500,
  successToastEnterMs: 720,
  successToastExitMs: 480,
} as const;
