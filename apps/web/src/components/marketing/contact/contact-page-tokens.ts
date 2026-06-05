/** Contact page — layout and surface tokens (Figma reference mock). */

export const CONTACT_PAGE_SURFACE = {
  cardBackground: "#f2f2f2",
  cardShadow: "0 24px 50px -30px rgba(45, 40, 35, 0.28)",
  calloutBackground: "#e8e8e8",
  headingColor: "#1d1c15",
  labelColor: "#4a4738",
  valueColor: "#1d1c15",
  inputBackground: "#fafafa",
  inputBorder: "rgba(255, 255, 255, 0.85)",
  buttonBackground: "#a68f7b",
  buttonHoverBackground: "#8f7968",
  securityTextColor: "#4a4738",
  iconBackground: "#ffffff",
} as const;

export const CONTACT_PAGE_LAYOUT = {
  cardRadiusPx: 32,
  cardPaddingPx: 36,
  cardGapPx: 28,
  iconSizePx: 56,
  inputRadiusPx: 12,
  buttonRadiusPx: 999,
  calloutRadiusPx: 16,
} as const;
