/**
 * Figma home weekly schedule — panel `161:301`, heading `270:128`, calendar `271:184`, CTA `172:1067`.
 */

export const HOME_WEEKLY_SCHEDULE_FIGMA = {
  panelFill: "rgba(255, 255, 255, 0.2)",
  panelRadiusPx: 50,
  headingColor: "#695f00",
  scheduleInk: "rgba(74, 71, 56, 0.62)",
  cardBorder: "#97907c",
  cardBorderWidthPx: 1.7,
  cardRadiusPx: 40,
  columnGapPx: 15,
  rowGapPx: 20,
} as const;

export const HOME_WEEKLY_SCHEDULE_LAYOUT = {
  titleFontSize: "clamp(2rem, 5vw, 4.375rem)",
  titleLineHeight: 1.1,
  subtitleMaxWidth: "32.875rem",
  cardMinHeight: "clamp(10.5rem, 28vw, 13.125rem)",
  mobileColumnWidth: "min(11.375rem, 78vw)",
} as const;
