import {
  endOfStudioDayInclusive,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from "@/lib/studio-timezone";

/** `YYYY-MM-DD` for the validity inputs, on the studio calendar. */
export function toValidityDateInputValue(isoValue: string): string {
  const parsed = new Date(isoValue.trim());
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return utcToStudioCalendarDate(parsed);
}

/** Midnight at the start of the selected studio calendar day. */
export function validityDateToPeriodStartIso(calendarDate: string): string {
  return studioWallClockToUtc(calendarDate, "00:00").toISOString();
}

/** 23:59:59.999 on the selected studio calendar day (that day is inclusive). */
export function validityDateToPeriodEndIso(calendarDate: string): string {
  return endOfStudioDayInclusive(
    studioWallClockToUtc(calendarDate, "12:00"),
  ).toISOString();
}
