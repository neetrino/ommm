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
  headingMaxWidth: "52rem",
  panelRadius: "clamp(1.25rem, 4vw, 3.125rem)",
  cardRadius: "clamp(1.25rem, 3.5vw, 2.5rem)",
  /** Mobile / tablet compact day panel cards. */
  cardMinHeightCompact: "clamp(7.5rem, 22vw, 10rem)",
  /** Desktop 7-column grid cards — fixed range avoids vw blow-up. */
  cardMinHeightGrid: "clamp(8.5rem, 11rem, 13.125rem)",
  heroOverlap: "clamp(1rem, 3.4vw, 3.0625rem)",
} as const;

/** Seven day chips in one row — scales gap/size, never scrolls off-screen. */
export const HOME_WEEKLY_SCHEDULE_DAY_STRIP_CLASS =
  "grid w-full min-w-0 grid-cols-7 gap-[clamp(0.125rem,1.1vw,0.625rem)]";

/** Day-of-week chip in the mobile / tablet compact schedule. */
export const HOME_WEEKLY_SCHEDULE_COMPACT_CHIP_CLASS =
  "flex min-h-[clamp(2.5rem,10vw,3.25rem)] w-full min-w-0 flex-col items-center justify-center rounded-[clamp(0.625rem,2vw,1.25rem)] border px-[clamp(0.125rem,0.6vw,0.375rem)] py-[clamp(0.25rem,1.2vw,0.625rem)] text-[clamp(0.5625rem,2.65vw,0.875rem)] leading-none tracking-tight transition-[background-color,border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#695f00]/40 focus-visible:ring-offset-1";

/** Side inset so rounded panel corners stay visible; scales down on large screens. */
export const HOME_WEEKLY_SCHEDULE_SECTION_CLASS =
  "relative z-10 w-full min-w-0 overflow-x-clip px-3 pb-8 sm:px-4 sm:pb-10 md:px-5 md:pb-12 lg:px-6 xl:px-8";

/** Inner content padding — shared by banner shell and mobile schedule carousel bleed. */
export const HOME_WEEKLY_SCHEDULE_INNER_CLASS =
  "mx-auto w-full min-w-0 px-3 sm:px-5 md:px-6 lg:px-10 xl:px-14 2xl:px-16";

/** Desktop 7-column grid — hidden below lg. */
export const HOME_WEEKLY_SCHEDULE_DESKTOP_GRID_CLASS =
  "hidden lg:grid lg:grid-cols-[repeat(7,minmax(0,1fr))] lg:gap-x-2 lg:gap-y-5 xl:gap-x-[0.9375rem]";
