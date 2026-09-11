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

/** Bookable + completed sessions for the marketing week view (past days as Closed). */
const PUBLIC_SESSION_STATUSES: readonly ClassSessionStatus[] = [
  ClassSessionStatus.ACTIVE,
  ClassSessionStatus.FULL,
  ClassSessionStatus.FINISHED,
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
  coach: {
    bio: string | null;
    user: {
      name: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  };
  _count: { bookings: number };
};

export type PublicScheduleItem = {
  id: string;
  className: string;
  instructorName: string;
  instructorAvatarUrl: string | null;
  instructorBio: string | null;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  availableSpots: number;
  level: string | null;
  status: ClassSessionStatus;
  sessionDate: string;
  /** Session-level notes (legacy); prefer `categoryDescription` for marketing copy. */
  description: string | null;
  /** Package-category description matched by class type name. */
  categoryDescription: string | null;
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

function normalizeCategoryKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Maps class sessions into public marketing rows (active, full, and finished).
 * Draft/cancelled stay hidden. Finished rows keep real session ids for display only.
 */
export function mapSessionsToPublicScheduleItems(
  sessions: readonly SessionForPublicSchedule[],
  categoryDescriptionByClassType: ReadonlyMap<string, string> = new Map(),
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
    const categoryDescription =
      categoryDescriptionByClassType.get(normalizeCategoryKey(classTypeName)) ??
      null;

    const bookedCount = session._count.bookings;
    const availableSpots = Math.max(session.capacity - bookedCount, 0);
    const durationMinutes = durationMinutesFromRange(startTime, endTime);
    const avatarUrl = session.coach.user.avatarUrl?.trim() ?? '';
    const bio = session.coach.bio?.trim() ?? '';

    items.push({
      id: session.id,
      className,
      instructorName,
      instructorAvatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
      instructorBio: bio.length > 0 ? bio : null,
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
      categoryDescription,
      isActive: true,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  return items;
}

/** Builds class-type → first non-empty package category description map. */
export function buildCategoryDescriptionByClassType(
  plans: readonly { categoryName: string; description: string | null }[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const plan of plans) {
    const key = normalizeCategoryKey(plan.categoryName);
    if (key.length === 0 || map.has(key)) {
      continue;
    }
    const description = plan.description?.trim() ?? '';
    if (description.length === 0) {
      continue;
    }
    map.set(key, description);
  }
  return map;
}

export const PUBLIC_SCHEDULE_SESSION_INCLUDE = {
  classType: { select: { name: true } },
  coach: {
    select: {
      bio: true,
      user: { select: { name: true, lastName: true, avatarUrl: true } },
    },
  },
  _count: {
    select: {
      bookings: { where: { status: BookingStatus.BOOKED } },
    },
  },
} as const;
