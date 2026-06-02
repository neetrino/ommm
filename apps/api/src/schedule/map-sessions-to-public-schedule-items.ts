import {
  BookingStatus,
  ClassSessionStatus,
  type ScheduleDayOfWeek,
  type ScheduleItem,
} from '@prisma/client';

const DAY_OF_WEEK_VALUES: readonly ScheduleDayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

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
  status: ClassSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  classType: { name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

function dayOfWeekFromDate(value: Date): ScheduleDayOfWeek {
  return DAY_OF_WEEK_VALUES[value.getDay()];
}

function formatTime24h(value: Date): string {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function durationMinutesFromRange(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function buildDedupeKey(params: {
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  className: string;
  classTypeName: string;
  instructorName: string;
}): string {
  return [
    params.dayOfWeek,
    params.startTime,
    params.className.toLowerCase(),
    params.classTypeName.toLowerCase(),
    params.instructorName.toLowerCase(),
  ].join('|');
}

/**
 * Maps bookable class sessions into weekly schedule items for public marketing views.
 */
export function mapSessionsToPublicScheduleItems(
  sessions: readonly SessionForPublicSchedule[],
): ScheduleItem[] {
  const seen = new Set<string>();
  const items: ScheduleItem[] = [];

  for (const session of sessions) {
    if (!PUBLIC_SESSION_STATUSES.includes(session.status)) {
      continue;
    }

    const dayOfWeek = dayOfWeekFromDate(session.startsAt);
    const startTime = formatTime24h(session.startsAt);
    const endTime = formatTime24h(session.endsAt);
    const className = session.title.trim();
    const instructorName = session.coach.user.name?.trim() || '—';
    const classTypeName = session.classType.name.trim();
    const dedupeKey = buildDedupeKey({
      dayOfWeek,
      startTime,
      className,
      classTypeName,
      instructorName,
    });
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);

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
    include: { user: { select: { name: true } } },
  },
  _count: {
    select: {
      bookings: { where: { status: BookingStatus.BOOKED } },
    },
  },
} as const;
