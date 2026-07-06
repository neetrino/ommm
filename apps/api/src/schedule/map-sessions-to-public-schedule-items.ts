import {
  BookingStatus,
  ClassSessionStatus,
  type ScheduleDayOfWeek,
} from '@prisma/client';
import {
  utcToStudioCalendarDate,
  utcToStudioDayOfWeek,
  utcToStudioWallClockTime,
} from '../common/studio-timezone';

const PUBLIC_SESSION_STATUSES: readonly ClassSessionStatus[] = [
  ClassSessionStatus.ACTIVE,
  ClassSessionStatus.FULL,
];

type SessionForPublicSchedule = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  level: string | null;
  status: ClassSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  classType: { name: string };
  coach: { user: { name: string | null; lastName: string | null } };
  _count: { bookings: number };
};

export type PublicScheduleItem = {
  id: string;
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  availableSpots: number;
  level: string | null;
  status: ClassSessionStatus;
  sessionDate: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function durationMinutesFromRange(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function formatCoachInstructorName(
  name: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const fullName = [name?.trim(), lastName?.trim()].filter(Boolean).join(' ');
  return fullName.length > 0 ? fullName : '—';
}

/**
 * Maps bookable class sessions into public marketing rows.
 * Each row keeps the real session id so the public Book button targets a bookable class.
 */
export function mapSessionsToPublicScheduleItems(
  sessions: readonly SessionForPublicSchedule[],
): PublicScheduleItem[] {
  const items: PublicScheduleItem[] = [];

  for (const session of sessions) {
    if (!PUBLIC_SESSION_STATUSES.includes(session.status)) {
      continue;
    }

    const dayOfWeek = utcToStudioDayOfWeek(session.startsAt);
    const startTime = utcToStudioWallClockTime(session.startsAt);
    const endTime = utcToStudioWallClockTime(session.endsAt);
    const className = session.title.trim();
    const instructorName = formatCoachInstructorName(
      session.coach.user.name,
      session.coach.user.lastName,
    );
    const classTypeName = session.classType.name.trim();

    const bookedCount = session._count.bookings;
    const availableSpots = Math.max(session.capacity - bookedCount, 0);
    const durationMinutes = durationMinutesFromRange(startTime, endTime);

    items.push({
      id: session.id,
      className,
      instructorName,
      classType: classTypeName,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes: durationMinutes > 0 ? durationMinutes : null,
      availableSpots,
      level: session.level,
      status: session.status,
      sessionDate: utcToStudioCalendarDate(session.startsAt),
      description: session.description,
      isActive: true,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  return items;
}

export const PUBLIC_SCHEDULE_SESSION_INCLUDE = {
  classType: { select: { name: true } },
  coach: {
    include: { user: { select: { name: true, lastName: true } } },
  },
  _count: {
    select: {
      bookings: { where: { status: BookingStatus.BOOKED } },
    },
  },
} as const;
