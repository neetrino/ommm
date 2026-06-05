import { isSameCalendarDay, startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";

export type SessionRelativeDay = "today" | "tomorrow" | null;

export type SessionDateTimeDisplay = {
  relativeDay: SessionRelativeDay;
  weekdayShort: string;
  weekdayLong: string;
  dayNumber: number;
  monthShort: string;
  monthLong: string;
  year: number;
  dateLine: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  durationMinutes: number;
};

function asValidDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveRelativeDay(start: Date): SessionRelativeDay {
  const today = startOfLocalDay(new Date());
  const sessionDay = startOfLocalDay(start);
  if (isSameCalendarDay(sessionDay, today)) {
    return "today";
  }
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameCalendarDay(sessionDay, tomorrow)) {
    return "tomorrow";
  }
  return null;
}

/**
 * Builds locale-aware date/time parts for session cards and list rows.
 */
export function buildSessionDateTimeDisplay(
  locale: string,
  startsAtIso: string,
  endsAtIso: string,
): SessionDateTimeDisplay | null {
  const start = asValidDate(startsAtIso);
  const end = asValidDate(endsAtIso);
  if (start === null || end === null) {
    return null;
  }

  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(start);
  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(start);
  const monthShort = new Intl.DateTimeFormat(locale, { month: "short" }).format(start);
  const monthLong = new Intl.DateTimeFormat(locale, { month: "long" }).format(start);
  const dateLine = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(start);
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  const startTime = timeFormatter.format(start);
  const endTime = timeFormatter.format(end);
  const durationMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60_000),
  );

  return {
    relativeDay: resolveRelativeDay(start),
    weekdayShort,
    weekdayLong,
    dayNumber: start.getDate(),
    monthShort,
    monthLong,
    year: start.getFullYear(),
    dateLine,
    startTime,
    endTime,
    timeRange: `${startTime} – ${endTime}`,
    durationMinutes,
  };
}
