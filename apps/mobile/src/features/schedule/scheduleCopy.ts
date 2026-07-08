/** Copy aligned with web `marketingPages.schedule`. */
export const scheduleCopy = {
  pageTitle: "Find a Class",
  filterClassTypeAll: "All class types",
  filterInstructorAll: "All instructors",
  prevDatesAria: "Previous dates",
  nextDatesAria: "Next dates",
  emptyTitle: "Nothing scheduled for this day",
  emptyBody:
    "Try another date or adjust your filters — new classes open throughout the week.",
  loading: "Loading…",
  loadError: "Could not load schedule",
  minutesShort: (count: number) => `${count} min`,
  spotsLeft: (count: number) => (count === 1 ? "1 spot left" : `${count} spots left`),
  spotsFull: "Full",
  bookCta: "Book",
} as const;

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
