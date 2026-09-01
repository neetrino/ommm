"use client";

/**
 * Calendar sheet motion — same enter/exit timing as shared overlay motion.
 */
export {
  useOverlayEnterExitMotion as useScheduleCalendarSheetMotion,
  OVERLAY_ENTER_EXIT_ENTER_MS as SCHEDULE_CALENDAR_SHEET_ENTER_MS,
  OVERLAY_ENTER_EXIT_EXIT_MS as SCHEDULE_CALENDAR_SHEET_EXIT_MS,
} from "@/hooks/use-overlay-enter-exit-motion";
