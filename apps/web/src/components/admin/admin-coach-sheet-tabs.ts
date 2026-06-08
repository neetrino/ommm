export const COACH_SHEET_TAB_PROFILE = "profile";
export const COACH_SHEET_TAB_DETAILS = "details";
export const COACH_SHEET_TAB_CLASSES = "classes";
export const COACH_SHEET_TAB_SCHEDULE = "schedule";

export type CoachSheetTabId =
  | typeof COACH_SHEET_TAB_PROFILE
  | typeof COACH_SHEET_TAB_DETAILS
  | typeof COACH_SHEET_TAB_CLASSES
  | typeof COACH_SHEET_TAB_SCHEDULE;

export const COACH_SHEET_TAB_ORDER: readonly CoachSheetTabId[] = [
  COACH_SHEET_TAB_PROFILE,
  COACH_SHEET_TAB_DETAILS,
  COACH_SHEET_TAB_CLASSES,
  COACH_SHEET_TAB_SCHEDULE,
];
