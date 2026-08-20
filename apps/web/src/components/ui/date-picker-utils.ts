export const DATE_PICKER_MONDAY_ANCHOR_DATE = new Date(2024, 0, 1);
export const DATE_PICKER_POPUP_MAX_WIDTH = 292;
export const DATE_PICKER_POPUP_MIN_WIDTH = 248;
export const DATE_PICKER_POPUP_EDGE_MARGIN = 8;
export const DATE_PICKER_POPUP_GAP = 8;
export const DATE_PICKER_FALLBACK_POPUP_HEIGHT = 320;

export const DATE_PICKER_CALENDAR_FOOTER_ACTION_CLASS =
  "text-base font-medium text-sand-700 transition-colors hover:text-sand-700/80";

export type DatePickerPopupPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function parseIsoDate(value: string): Date | null {
  const parts = value.split("-");
  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatIsoDate(value: Date): string {
  const year = String(value.getFullYear());
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function isSameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBeforeCalendarDate(date: Date, boundary: Date): boolean {
  return startOfCalendarDay(date).getTime() < startOfCalendarDay(boundary).getTime();
}

export function getGridStartDate(visibleMonth: Date): Date {
  const monthStart = startOfMonth(visibleMonth);
  const weekdayFromMonday = (monthStart.getDay() + 6) % 7;
  return addDays(monthStart, -weekdayFromMonday);
}

export function getGridEndDate(visibleMonth: Date): Date {
  const monthEnd = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  );
  const weekday = monthEnd.getDay();
  const daysToSunday = weekday === 0 ? 0 : 7 - weekday;
  return addDays(monthEnd, daysToSunday);
}
