const timeFmt: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

const weekdayFmt: Intl.DateTimeFormatOptions = {
  weekday: "short",
};

const monthDayFmt: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
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

export function formatDurationMinutes(startIso: string, endIso: string): string {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) {
    return "";
  }
  const mins = Math.round((b - a) / 60000);
  return `${mins} min`;
}
