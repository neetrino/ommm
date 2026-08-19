import type { Prisma } from '@prisma/client';
import {
  endOfStudioDayInclusive,
  studioWallClockToUtc,
} from './studio-timezone';

const FILTER_CALENDAR_DATE = /^(\d{4}-\d{2}-\d{2})/;

export function parseFilterCalendarDate(
  value: string | undefined,
): string | undefined {
  const match = FILTER_CALENDAR_DATE.exec(value?.trim() ?? '');
  return match?.[1];
}

function studioDayStart(calendarDate: string): Date {
  return studioWallClockToUtc(calendarDate, '00:00');
}

function studioDayEnd(calendarDate: string): Date {
  return endOfStudioDayInclusive(studioWallClockToUtc(calendarDate, '12:00'));
}

/** Inclusive studio-day bounds. A lone `from` is that single calendar day. */
export function buildStudioDateTimeFilter(
  from?: string,
  to?: string,
): Prisma.DateTimeFilter | undefined {
  const fromDay = parseFilterCalendarDate(from);
  const toDay = parseFilterCalendarDate(to) ?? fromDay;
  if (!fromDay && !toDay) {
    return undefined;
  }
  return {
    ...(fromDay ? { gte: studioDayStart(fromDay) } : {}),
    ...(toDay ? { lte: studioDayEnd(toDay) } : {}),
  };
}
