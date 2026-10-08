import { ClassSessionStatus } from '@prisma/client';
import {
  utcToStudioCalendarDate,
  utcToStudioDayOfWeek,
  utcToStudioWallClockTime,
} from '../common/studio-timezone';
import {
  scheduleExportCountLabel,
  scheduleExportCopy,
  scheduleExportStatusLabel,
  scheduleExportWeekdayLabel,
  type ScheduleExportCopy,
} from './classes-sessions-export-labels';

export type ScheduleExportSession = {
  title: string;
  classTypeName: string;
  coachName: string;
  startsAt: Date;
  endsAt: Date;
  level: string | null;
  capacity: number;
  booked: number;
  status: ClassSessionStatus;
};

export type ScheduleExportCell = string | number | null;

type ScheduleExportSource = {
  title: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  level: string | null;
  status: ClassSessionStatus;
  classType: { name: string };
  coach: { user: { name: string | null; lastName: string | null } };
  _count: { bookings: number };
};

/** Maps one admin session into the workbook row shape. */
export function toScheduleExportSession(
  row: ScheduleExportSource,
): ScheduleExportSession {
  return {
    title: row.title,
    classTypeName: row.classType.name,
    coachName: formatExportCoachName(row.coach.user),
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    level: row.level,
    capacity: row.capacity,
    booked: row._count.bookings,
    status: row.status,
  };
}

export function scheduleExportHeaderCells(copy: ScheduleExportCopy): string[] {
  return [
    copy.date,
    copy.weekday,
    copy.start,
    copy.end,
    copy.className,
    copy.type,
    copy.coach,
    copy.level,
    copy.booked,
    copy.capacity,
    copy.spots,
    copy.status,
  ];
}

export function scheduleExportSessionCells(
  row: ScheduleExportSession,
  locale: string | undefined,
): ScheduleExportCell[] {
  const spots = Math.max(row.capacity - row.booked, 0);
  return [
    formatExportDay(utcToStudioCalendarDate(row.startsAt)),
    scheduleExportWeekdayLabel(locale, utcToStudioDayOfWeek(row.startsAt)),
    utcToStudioWallClockTime(row.startsAt),
    utcToStudioWallClockTime(row.endsAt),
    row.title,
    row.classTypeName,
    row.coachName,
    row.level?.trim() || null,
    row.booked,
    row.capacity,
    spots,
    scheduleExportStatusLabel(locale, row.status),
  ];
}

export function formatScheduleExportPeriod(input: {
  locale?: string;
  from?: string;
  to?: string;
  count: number;
}): string {
  const range = formatExportRange(input.from, input.to);
  const scope = range ?? scheduleExportCopy(input.locale).allClasses;
  return `${scope} · ${scheduleExportCountLabel(input.locale, input.count)}`;
}

export function scheduleExportFilename(from?: string, to?: string): string {
  const start = calendarDay(from);
  const end = calendarDay(to);
  if (start && end) {
    return start === end
      ? `schedule-${start}.xlsx`
      : `schedule-${start}_${end}.xlsx`;
  }
  if (start) {
    return `schedule-from-${start}.xlsx`;
  }
  if (end) {
    return `schedule-to-${end}.xlsx`;
  }
  return 'schedule.xlsx';
}

export function scheduleExportContentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

function formatExportCoachName(user: {
  name: string | null;
  lastName: string | null;
}): string {
  const parts = [user.name, user.lastName]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts.join(' ') : '—';
}

function formatExportDay(isoDay: string): string {
  const [year, month, day] = isoDay.split('-');
  if (!year || !month || !day) {
    return isoDay;
  }
  return `${day}/${month}/${year}`;
}

function formatExportRange(from?: string, to?: string): string | null {
  const start = calendarDay(from);
  const end = calendarDay(to);
  if (start && end) {
    const startLabel = formatExportDay(start);
    const endLabel = formatExportDay(end);
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }
  if (start) {
    return formatExportDay(start);
  }
  if (end) {
    return formatExportDay(end);
  }
  return null;
}

function calendarDay(value: string | undefined): string | null {
  const day = value?.slice(0, 10) ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}
