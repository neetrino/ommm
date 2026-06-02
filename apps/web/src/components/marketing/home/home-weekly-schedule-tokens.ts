/**
 * Figma home weekly schedule — panel `196:1293`, day tabs `196:1300`, session rows `196:1315`.
 */

export const HOME_WEEKLY_SCHEDULE_FIGMA = {
  panelFill: "rgba(255, 255, 255, 0.2)",
  panelRadiusPx: 50,
  headingColor: "#695f00",
  scheduleInk: "#4a4738",
  titleInk: "#1d1c15",
  spotsUrgent: "#af5008",
  dayChipActiveFill: "#97907c",
  dayChipActiveText: "#fbf5d5",
  dayChipIdleBorder: "#97907c",
  dayChipIdleText: "#97907c",
  dayChipBorderWidthPx: 1.7,
  dayChipHeightPx: 45,
  reserveButtonFill: "rgba(255, 255, 255, 0.33)",
  reserveButtonHoverFill: "rgba(255, 255, 255, 0.42)",
  reserveButtonText: "#000000",
  reserveButtonBorder: "rgba(255, 255, 255, 0.55)",
  reserveButtonEdgeHighlight: "rgba(255, 255, 255, 0.85)",
  reserveButtonBlurPx: 10,
  sessionRowRadiusPx: 32,
  sessionRowPaddingPx: 24,
  sessionRowMinHeightPx: 103,
  clockIconSizePx: 24,
  /** Spots at or below this count use `spotsUrgent`. */
  spotsUrgentThreshold: 3,
} as const;

/** Figma session row gradients — yellow, blue, peach (`196:1315` / `196:1334` / `196:1353`). */
export const HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS = [
  "linear-gradient(to right, #efe5a8, #e2d672)",
  "linear-gradient(to right, #e5f4f9, #bbd2da)",
  "linear-gradient(to right, #f6d0bd, #cbc2b4)",
  "linear-gradient(to right, #fcf6d6, #ede9dd)",
  "linear-gradient(to right, #ede9dd, #cbc2b4)",
  "linear-gradient(to right, #bbd2da, #e5f4f9)",
] as const;

export const HOME_WEEKLY_SCHEDULE_LAYOUT = {
  titleFontSize: "clamp(1.75rem, 6.5vw, 4.375rem)",
  titleLineHeight: 1.1,
  subtitleMaxWidth: "39.25rem",
  headingMaxWidth: "52rem",
  panelRadius: "clamp(1.25rem, 4vw, 3.125rem)",
  sessionRowRadius: "clamp(1.25rem, 2vw, 2rem)",
  /** Space below hero background before weekly schedule content. */
  sectionTopGap: "clamp(1.5rem, 5vw, 4rem)",
  dayTabGap: "clamp(0.375rem, 1.2vw, 0.75rem)",
  sessionListGap: "clamp(1rem, 2vw, 1rem)",
} as const;

/** Side inset so rounded panel corners stay visible; scales down on large screens. */
export const HOME_WEEKLY_SCHEDULE_SECTION_CLASS =
  "relative z-10 w-full min-w-0 overflow-x-clip px-3 pb-8 sm:px-4 sm:pb-10 md:px-5 md:pb-12 lg:px-6 xl:px-8";

/** Inner content padding — shared by banner shell and schedule list. */
export const HOME_WEEKLY_SCHEDULE_INNER_CLASS =
  "mx-auto w-full min-w-0 px-3 sm:px-5 md:px-6 lg:px-10 xl:px-14 2xl:px-16";

/** Figma day-of-week pill — active fill or idle outline (`196:1301` / `196:1303`). */
export const HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS =
  "inline-flex h-[2.8125rem] shrink-0 items-center justify-center rounded-full border px-4 text-sm leading-[1.3125rem] tracking-[0.03125rem] transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#695f00]/40 focus-visible:ring-offset-1 sm:px-5 sm:text-sm";

export const HOME_WEEKLY_SCHEDULE_ASSETS = {
  clockIcon: "/marketing/home/schedule/home-weekly-schedule-clock.svg",
} as const;
