import { formatTimeForUi } from "@/lib/format-time-display";
import {
  addStudioCalendarDays,
  STUDIO_TIMEZONE,
  utcToStudioCalendarDate,
} from "@/lib/studio-timezone";

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

const STUDIO_DATE_PARTS = {
  timeZone: STUDIO_TIMEZONE,
} as const satisfies Intl.DateTimeFormatOptions;

/**
 * Node ICU and browsers disagree on Russian weekday/month casing (`пт` vs `Пт`).
 * Normalize so SSR and client markup always match.
 */
function normalizeIntlLabel(locale: string, value: string): string {
  if (value.length === 0) {
    return value;
  }
  const lower = value.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

function asValidDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveRelativeDay(start: Date): SessionRelativeDay {
  const sessionDay = utcToStudioCalendarDate(start);
  const today = utcToStudioCalendarDate(new Date());
  if (sessionDay === today) {
    return "today";
  }
  if (sessionDay === addStudioCalendarDays(today, 1)) {
    return "tomorrow";
  }
  return null;
}

/**
 * Builds locale-aware date/time parts for session cards and list rows.
 * All wall-clock values use the studio timezone (Asia/Yerevan).
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

  const weekdayShort = normalizeIntlLabel(
    locale,
    new Intl.DateTimeFormat(locale, {
      ...STUDIO_DATE_PARTS,
      weekday: "short",
    }).format(start),
  );
  const weekdayLong = normalizeIntlLabel(
    locale,
    new Intl.DateTimeFormat(locale, {
      ...STUDIO_DATE_PARTS,
      weekday: "long",
    }).format(start),
  );
  const monthShort = normalizeIntlLabel(
    locale,
    new Intl.DateTimeFormat(locale, {
      ...STUDIO_DATE_PARTS,
      month: "short",
    }).format(start),
  );
  const monthLong = normalizeIntlLabel(
    locale,
    new Intl.DateTimeFormat(locale, {
      ...STUDIO_DATE_PARTS,
      month: "long",
    }).format(start),
  );
  const dateLine = normalizeIntlLabel(
    locale,
    new Intl.DateTimeFormat(locale, {
      ...STUDIO_DATE_PARTS,
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(start),
  );
  const startTime = formatTimeForUi(start, locale);
  const endTime = formatTimeForUi(end, locale);
  const durationMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60_000),
  );
  const [yearRaw, , dayRaw] = utcToStudioCalendarDate(start).split("-");
  const year = Number(yearRaw);
  const dayNumber = Number(dayRaw);

  return {
    relativeDay: resolveRelativeDay(start),
    weekdayShort,
    weekdayLong,
    dayNumber,
    monthShort,
    monthLong,
    year,
    dateLine,
    startTime,
    endTime,
    timeRange: `${startTime} – ${endTime}`,
    durationMinutes,
  };
}
