import { STUDIO_TIMEZONE } from "../studioTimezone";

const timeFmt: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  timeZone: STUDIO_TIMEZONE,
};

const weekdayFmt: Intl.DateTimeFormatOptions = {
  weekday: "short",
  timeZone: STUDIO_TIMEZONE,
};

const monthDayFmt: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  timeZone: STUDIO_TIMEZONE,
};

export function formatSessionStartLabel(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const w = d.toLocaleString(locale, weekdayFmt);
  const md = d.toLocaleString(locale, monthDayFmt);
  const t = d.toLocaleString(locale, timeFmt);
  return `${w}, ${md} · ${t}`;
}

export function formatSessionScheduleShort(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const md = d.toLocaleString(locale, monthDayFmt);
  const t = d.toLocaleString(locale, timeFmt);
  return `${md}, ${t}`;
}

export function formatDurationMinutes(
  startIso: string,
  endIso: string,
  formatMinutes?: (minutes: number) => string,
): string {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) {
    return "";
  }
  const mins = Math.round((b - a) / 60000);
  if (formatMinutes) {
    return formatMinutes(mins);
  }
  return `${mins} min`;
}
