import type { ClassSessionStatus } from '@prisma/client';
import { resolveAdminSessionStatus } from '../classes/classes-session.helpers';
import {
  addStudioCalendarDays,
  endOfStudioDayInclusive,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';

/** History window so coaches can scroll week/month into their own past classes. */
export const COACH_PANEL_SCHEDULE_PAST_DAYS = 365;

/** Planning window beyond today for assigned upcoming classes. */
export const COACH_PANEL_SCHEDULE_FUTURE_DAYS = 90;

/** Defensive cap for one coach's schedule list. */
export const COACH_PANEL_SESSIONS_LIST_LIMIT = 2000;

export type CoachPanelSessionRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: ClassSessionStatus;
  classType: { id: string; name: string };
  coach: {
    id: string;
    user: { name: string | null; lastName: string | null };
  };
  _count: { bookings: number };
};

export type CoachPanelSessionRecord = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: ClassSessionStatus;
  classType: { id: string; name: string };
  coach: {
    id: string;
    user: { name: string | null; lastName: string | null };
  };
  _count: { bookings: number };
};

export function resolveCoachPanelScheduleRange(now: Date = new Date()): {
  from: Date;
  to: Date;
} {
  const today = utcToStudioCalendarDate(now);
  const fromDay = addStudioCalendarDays(today, -COACH_PANEL_SCHEDULE_PAST_DAYS);
  const toDay = addStudioCalendarDays(today, COACH_PANEL_SCHEDULE_FUTURE_DAYS);
  return {
    from: studioWallClockToUtc(fromDay, '00:00'),
    to: endOfStudioDayInclusive(studioWallClockToUtc(toDay, '12:00')),
  };
}

export function mapCoachPanelSessionRow(
  session: CoachPanelSessionRecord,
  now: Date = new Date(),
): CoachPanelSessionRow {
  return {
    id: session.id,
    title: session.title,
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    capacity: session.capacity,
    level: session.level,
    classFormat: session.classFormat,
    status: resolveAdminSessionStatus({
      status: session.status,
      endsAt: session.endsAt,
      bookedCount: session._count.bookings,
      capacity: session.capacity,
      now,
    }),
    classType: session.classType,
    coach: session.coach,
    _count: session._count,
  };
}
