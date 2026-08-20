import { BadRequestException } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  Prisma,
  type ClassSession,
  type ScheduleDayOfWeek,
} from '@prisma/client';
import type { CreateSessionBatchDto } from './dto/create-session-batch.dto';
import type { CreateSessionDto } from './dto/create-session.dto';
import type { UpdateSessionDto } from './dto/update-session.dto';

export const SESSION_RECURRENCE_PATTERN = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  CUSTOM_WEEKDAYS: 'CUSTOM_WEEKDAYS',
} as const;

export const SCHEDULE_DAY_INDEX: Record<ScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const MAX_BATCH_SESSIONS = 200;

export type SessionRecurrencePatternValue =
  (typeof SESSION_RECURRENCE_PATTERN)[keyof typeof SESSION_RECURRENCE_PATTERN];

export type SessionRecurrencePayload = {
  recurrencePattern: SessionRecurrencePatternValue;
  recurrenceWeekdays: ScheduleDayOfWeek[];
  recurrenceEndsAt: Date | null;
  recurrenceCount: number | null;
};

export type ClassSessionWithRecurrence = ClassSession & {
  recurrencePattern: SessionRecurrencePatternValue;
  recurrenceWeekdays: ScheduleDayOfWeek[];
  recurrenceEndsAt: Date | null;
  recurrenceCount: number | null;
};

export const ADMIN_SESSION_INCLUDE =
  Prisma.validator<Prisma.ClassSessionInclude>()({
    classType: true,
    coach: {
      include: {
        user: { select: { name: true, lastName: true } },
      },
    },
    _count: {
      select: {
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.BOOKED,
                BookingStatus.COMPLETED,
                BookingStatus.MISSED,
              ],
            },
          },
        },
      },
    },
  });

export type AdminSessionRow = Prisma.ClassSessionGetPayload<{
  include: typeof ADMIN_SESSION_INCLUDE;
}>;

export function normalizeOptional(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function assertTimeRange(startsAt: Date, endsAt: Date): void {
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new BadRequestException('Invalid class date range');
  }
  if (endsAt <= startsAt) {
    throw new BadRequestException('Class end time must be after start time');
  }
}

export function assertTimeValue(value: string): void {
  const [hourRaw, minuteRaw] = value.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new BadRequestException('Invalid weekly slot time');
  }
}

export function parseLocalDate(value: string): Date {
  const [yearRaw, monthRaw, dayRaw] = value.slice(0, 10).split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    Number.isNaN(parsed.getTime())
  ) {
    throw new BadRequestException('Invalid calendar schedule date');
  }
  return parsed;
}

export function localDateTimeToUtc(
  date: Date,
  time: string,
  timezoneOffsetMinutes: number,
): Date {
  assertTimeValue(time);
  const [hourRaw, minuteRaw] = time.split(':');
  const utcMs =
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      Number(hourRaw),
      Number(minuteRaw),
    ) +
    timezoneOffsetMinutes * 60_000;
  return new Date(utcMs);
}

export function buildBatchSessionData(
  dto: CreateSessionBatchDto,
  title: string,
): Prisma.ClassSessionUncheckedCreateInput[] {
  const startDate = parseLocalDate(dto.startDate);
  const endDate = parseLocalDate(dto.endDate);
  if (endDate < startDate) {
    throw new BadRequestException(
      'Calendar schedule end date must be after start date',
    );
  }

  const rows: Prisma.ClassSessionUncheckedCreateInput[] = [];
  for (
    const cursor = new Date(startDate);
    cursor <= endDate;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    for (const slot of dto.slots) {
      if (cursor.getUTCDay() !== SCHEDULE_DAY_INDEX[slot.weekday]) {
        continue;
      }
      const startsAt = localDateTimeToUtc(
        cursor,
        slot.startTime,
        dto.timezoneOffsetMinutes,
      );
      const endsAt = localDateTimeToUtc(
        cursor,
        slot.endTime,
        dto.timezoneOffsetMinutes,
      );
      assertTimeRange(startsAt, endsAt);
      rows.push({
        title,
        description: normalizeOptional(dto.description),
        classTypeId: dto.classTypeId,
        coachId: dto.coachId,
        startsAt,
        endsAt,
        capacity: dto.capacity,
        level: normalizeOptional(dto.level),
        priceCents: 0,
        status: dto.status ?? ClassSessionStatus.ACTIVE,
        recurrencePattern: SESSION_RECURRENCE_PATTERN.NONE,
        recurrenceWeekdays: [],
        recurrenceEndsAt: null,
        recurrenceCount: null,
      });
    }
  }

  if (rows.length === 0) {
    throw new BadRequestException(
      'Calendar schedule did not generate any classes',
    );
  }
  if (rows.length > MAX_BATCH_SESSIONS) {
    throw new BadRequestException(
      `Calendar schedule can generate at most ${MAX_BATCH_SESSIONS} classes`,
    );
  }
  return rows;
}

export function buildRecurrencePayloadForCreate(
  dto: CreateSessionDto,
): SessionRecurrencePayload {
  return buildRecurrencePayload({
    pattern: dto.recurrencePattern ?? SESSION_RECURRENCE_PATTERN.NONE,
    weekdays: dto.recurrenceWeekdays ?? [],
    recurrenceEndsAt: dto.recurrenceEndsAt
      ? new Date(dto.recurrenceEndsAt)
      : null,
    recurrenceCount: dto.recurrenceCount ?? null,
  });
}

export function buildRecurrencePayloadForUpdate(
  dto: UpdateSessionDto,
  current: ClassSessionWithRecurrence,
): SessionRecurrencePayload {
  return buildRecurrencePayload({
    pattern: dto.recurrencePattern ?? current.recurrencePattern,
    weekdays: dto.recurrenceWeekdays ?? current.recurrenceWeekdays,
    recurrenceEndsAt:
      dto.recurrenceEndsAt === undefined
        ? current.recurrenceEndsAt
        : dto.recurrenceEndsAt
          ? new Date(dto.recurrenceEndsAt)
          : null,
    recurrenceCount:
      dto.recurrenceCount === undefined
        ? current.recurrenceCount
        : dto.recurrenceCount,
  });
}

function buildRecurrencePayload(params: {
  pattern: SessionRecurrencePatternValue;
  weekdays: ScheduleDayOfWeek[];
  recurrenceEndsAt: Date | null;
  recurrenceCount: number | null;
}): SessionRecurrencePayload {
  if (
    params.pattern === SESSION_RECURRENCE_PATTERN.CUSTOM_WEEKDAYS &&
    params.weekdays.length === 0
  ) {
    throw new BadRequestException(
      'Choose at least one weekday for custom recurrence',
    );
  }
  if (params.pattern === SESSION_RECURRENCE_PATTERN.NONE) {
    return emptyRecurrencePayload();
  }
  return {
    recurrencePattern: params.pattern,
    recurrenceWeekdays:
      params.pattern === SESSION_RECURRENCE_PATTERN.CUSTOM_WEEKDAYS
        ? params.weekdays
        : [],
    recurrenceEndsAt: params.recurrenceEndsAt,
    recurrenceCount: params.recurrenceCount,
  };
}

function emptyRecurrencePayload(): SessionRecurrencePayload {
  return {
    recurrencePattern: SESSION_RECURRENCE_PATTERN.NONE,
    recurrenceWeekdays: [],
    recurrenceEndsAt: null,
    recurrenceCount: null,
  };
}

export function resolveAdminSessionStatus(params: {
  status: ClassSessionStatus;
  endsAt: Date;
  bookedCount: number;
  capacity: number;
  now?: Date;
}): ClassSessionStatus {
  const { status, endsAt, bookedCount, capacity } = params;
  if (
    status === ClassSessionStatus.CANCELLED ||
    status === ClassSessionStatus.DRAFT ||
    status === ClassSessionStatus.FINISHED
  ) {
    return status;
  }

  const now = params.now ?? new Date();
  if (endsAt.getTime() <= now.getTime()) {
    return ClassSessionStatus.FINISHED;
  }

  if (
    (status === ClassSessionStatus.ACTIVE ||
      status === ClassSessionStatus.FULL) &&
    bookedCount >= capacity
  ) {
    return ClassSessionStatus.FULL;
  }

  return status;
}

export function mapAdminSessionRows(
  sessions: Array<
    AdminSessionRow & {
      status: ClassSessionStatus;
      endsAt: Date;
      _count: { bookings: number };
      capacity: number;
    }
  >,
  now: Date = new Date(),
): AdminSessionRow[] {
  return sessions.map((session) => ({
    ...session,
    status: resolveAdminSessionStatus({
      status: session.status,
      endsAt: session.endsAt,
      bookedCount: session._count.bookings,
      capacity: session.capacity,
      now,
    }),
  }));
}
