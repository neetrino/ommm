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
  titleFontSize: "clamp(1.75rem, 6.5vw, 4.375rem)",
  titleLineHeight: 1.1,
  subtitleMaxWidth: "32.875rem",
  panelRadius: "clamp(1.25rem, 4vw, 3.125rem)",
  cardRadius: "clamp(1.25rem, 3.5vw, 2.5rem)",
  cardMinHeight: "clamp(9.5rem, 42vw, 13.125rem)",
  /** One day column in the mobile horizontal carousel. */
  mobileColumnWidth: "min(11.375rem, 82vw)",
  heroOverlap: "clamp(1rem, 3.4vw, 3.0625rem)",
} as const;
