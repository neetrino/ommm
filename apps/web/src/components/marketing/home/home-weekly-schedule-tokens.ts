/**
 * Figma home weekly schedule — panel `196:1293`, day tabs `196:1300`, session rows `196:1315`.
 */

import { HOME_HERO_FIGMA } from "@/components/marketing/home/home-hero-banner-tokens";

export const HOME_WEEKLY_SCHEDULE_FIGMA = {
  /** Solid hero yellow — matches hero band `#faf3cb` (`196:1293`). */
  panelFill: HOME_HERO_FIGMA.sectionBackground,
  panelRadiusPx: HOME_HERO_FIGMA.frostPanelRadiusPx,
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

const weeklyScheduleSectionOuterPaddingBottom = "clamp(2rem, 6vw, 4rem)";

/** Adjusts visible space between schedule panel bottom and Our Core Practices heading. */
const weeklyScheduleToClassesHeadingGapAdjustPx = -15;

const weeklyScheduleSectionTopGap = "clamp(1.5rem, 5vw, 4rem)";

/** Extra drop below the hero overlap — panel sits lower while photo still fills the band above. */
const weeklySchedulePanelLowerOffsetPx = 155;

/** Extra lift so Our Core Practices covers bottom `rounded-[50px]` corner cutouts. */
const weeklyScheduleClassesCornerCoverPx = HOME_WEEKLY_SCHEDULE_FIGMA.panelRadiusPx + 12;

const weeklySchedulePanelTopInsetPx =
  HOME_WEEKLY_SCHEDULE_FIGMA.panelRadiusPx + weeklySchedulePanelLowerOffsetPx;

/** Extra space inside the yellow panel — above the Weekly Schedule title. */
const weeklySchedulePanelHeadingTopExtraPx = 56;

const weeklySchedulePanelPaddingTop = "clamp(1.5rem, 5vw, 3rem)";

export const HOME_WEEKLY_SCHEDULE_LAYOUT = {
  titleFontSize: "clamp(1.75rem, 6.5vw, 4.375rem)",
  titleLineHeight: 1.1,
  subtitleMaxWidth: "39.25rem",
  headingMaxWidth: "52rem",
  sessionRowRadius: "clamp(1.25rem, 2vw, 2rem)",
  sectionPaddingX: "clamp(1rem, 5vw, 5rem)",
  sectionPaddingTop: `calc(${weeklySchedulePanelPaddingTop} + ${weeklySchedulePanelHeadingTopExtraPx}px)`,
  sectionPaddingBottom: "clamp(2rem, 5vw, 3.5rem)",
  sectionOuterPaddingBottom: weeklyScheduleSectionOuterPaddingBottom,
  /** Pull Our Core Practices through outer band + bottom corner cutouts of `rounded-[50px]` panel. */
  sectionClassesOverlap: `calc(${weeklyScheduleSectionOuterPaddingBottom} + ${weeklyScheduleClassesCornerCoverPx}px)`,
  /** Tweaks panel-bottom → Our Core Practices title spacing without changing hero overlap. */
  sectionToClassesHeadingGapAdjustPx: weeklyScheduleToClassesHeadingGapAdjustPx,
  headerGapPx: 28,
  /** Base breathing room between hero CTAs and schedule panel content. */
  sectionTopGap: weeklyScheduleSectionTopGap,
  /** Hero photo extends under the transparent band above the panel (`196:1293`). */
  sectionHeroOverlap: `calc(${weeklyScheduleSectionTopGap} + ${weeklySchedulePanelTopInsetPx}px)`,
  /** Transparent band above panel — lowers the card while hero stays visible underneath. */
  sectionPanelTopInset: `${weeklySchedulePanelTopInsetPx}px`,
  dayTabGap: "clamp(0.375rem, 1.2vw, 0.75rem)",
  sessionListGap: "clamp(1rem, 2vw, 1rem)",
} as const;

/** Overlaps hero — panel `z-10` sits on photo; Our Core Practices gradient overlaps from below. */
export const HOME_WEEKLY_SCHEDULE_SECTION_CLASS =
  "relative z-20 w-full min-w-0 overflow-x-clip px-0";

/** Solid yellow panel — same shell border as Packages `196:1251`, no glass fill. */
export const HOME_WEEKLY_SCHEDULE_PANEL_SHELL_CLASS =
  "relative isolate z-10 w-full min-w-0 overflow-hidden rounded-[50px] border border-white/55 ring-1 ring-white/35";

export const HOME_WEEKLY_SCHEDULE_PANEL_SURFACE = {
  backgroundColor: HOME_WEEKLY_SCHEDULE_FIGMA.panelFill,
} as const;

/** Inner content padding — shared by banner shell and schedule list. */
export const HOME_WEEKLY_SCHEDULE_INNER_CLASS =
  "mx-auto w-full min-w-0 px-3 sm:px-5 md:px-6 lg:px-10 xl:px-14 2xl:px-16";

/** Figma day-of-week pill — active fill or idle outline (`196:1301` / `196:1303`). */
export const HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS =
  "inline-flex h-[2.8125rem] shrink-0 items-center justify-center rounded-full border px-4 text-sm leading-[1.3125rem] tracking-[0.03125rem] transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#695f00]/40 focus-visible:ring-offset-1 sm:px-5 sm:text-sm";

export const HOME_WEEKLY_SCHEDULE_ASSETS = {
  clockIcon: "/marketing/home/schedule/home-weekly-schedule-clock.svg",
} as const;
