export const COACH_SHEET_TAB_PROFILE = "profile";
export const COACH_SHEET_TAB_DETAILS = "details";
export const COACH_SHEET_TAB_CLASSES = "classes";
export const COACH_SHEET_TAB_SCHEDULE = "schedule";

export const COACH_PROFILE_TAB_QUERY_KEY = "coachTab";

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

const COACH_SHEET_TAB_IDS = new Set<string>(COACH_SHEET_TAB_ORDER);

/** Parses `coachTab` search param into a valid coach sheet tab id. */
export function parseCoachSheetTabId(value: string | null): CoachSheetTabId {
  if (value !== null && COACH_SHEET_TAB_IDS.has(value)) {
    return value as CoachSheetTabId;
  }
  return COACH_SHEET_TAB_PROFILE;
}
