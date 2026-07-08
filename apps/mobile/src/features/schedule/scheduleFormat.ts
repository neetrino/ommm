export function formatScheduleSelectedDayLabel(date: Date, locale: string): string {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${weekday}, ${day}/${month}/${year}`;
}

export function formatScheduleMonthLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

export function formatScheduleWeekdayShort(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date).toUpperCase();
}

export function formatScheduleTimeHHmm(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
