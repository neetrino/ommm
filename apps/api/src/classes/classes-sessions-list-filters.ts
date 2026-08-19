import { ClassSessionStatus, Prisma } from '@prisma/client';
import { buildStudioDateTimeFilter } from '../common/studio-date-range';
import { utcToStudioCalendarDate } from '../common/studio-timezone';
import {
  buildTokenAndWhere,
  containsInsensitive,
  splitSearchTokens,
} from '../common/token-text-search';
import type { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';

export const SESSIONS_FILTER_SCAN_LIMIT = 3000;

function startsAtIso(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString();
}

function startsAtDateOnly(value: string | Date): string {
  return startsAtIso(value).slice(0, 10);
}

export type SessionListFilterRow = {
  title: string;
  startsAt: string | Date;
  endsAt: string | Date;
  capacity: number;
  level: string | null;
  status: string;
  classType: { id: string; name: string };
  coach: {
    id: string;
    user: { name: string | null; lastName?: string | null };
  };
  _count: { bookings: number };
};

function parseCsv(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitSessionLevels(level: string | null): string[] {
  if (!level) {
    return [];
  }
  return level
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function spotsLeft(row: SessionListFilterRow): number {
  return Math.max(row.capacity - row._count.bookings, 0);
}

function coachDisplayName(row: SessionListFilterRow): string {
  const user = row.coach.user;
  return [user.name, user.lastName].filter(Boolean).join(' ').trim();
}

export function requiresSessionsPostProcessing(
  query: AdminListSessionsQueryDto,
): boolean {
  return (
    Boolean(query.q?.trim()) ||
    Boolean(query.from || query.to) ||
    parseCsv(query.coachIds).length > 0 ||
    parseCsv(query.classTypeIds).length > 0 ||
    parseCsv(query.levels).length > 0 ||
    parseCsv(query.statuses).length > 0 ||
    parseCsv(query.availability).length > 0 ||
    parseCsv(query.timeOfDay).length > 0 ||
    parseCsv(query.quick).length > 0
  );
}

export function buildSessionsListWhere(
  query: AdminListSessionsQueryDto,
): Prisma.ClassSessionWhereInput {
  const and: Prisma.ClassSessionWhereInput[] = [];

  const startsAt = buildStudioDateTimeFilter(query.from, query.to);
  if (startsAt) {
    and.push({ startsAt });
  }

  const coachIds = parseCsv(query.coachIds);
  if (coachIds.length > 0) {
    and.push({ coachId: { in: coachIds } });
  }

  const classTypeIds = parseCsv(query.classTypeIds);
  if (classTypeIds.length > 0) {
    and.push({ classTypeId: { in: classTypeIds } });
  }

  const searchWhere = buildTokenAndWhere(
    query.q,
    (token): Prisma.ClassSessionWhereInput => ({
      OR: [
        { title: containsInsensitive(token) },
        { classType: { name: containsInsensitive(token) } },
        {
          coach: {
            user: {
              OR: [
                { name: containsInsensitive(token) },
                { lastName: containsInsensitive(token) },
                { email: containsInsensitive(token) },
              ],
            },
          },
        },
      ],
    }),
  );
  if (searchWhere) {
    and.push(searchWhere);
  }

  const statuses = parseCsv(query.statuses).filter(
    (status) => status !== ClassSessionStatus.FULL,
  );
  if (statuses.length > 0) {
    and.push({
      status: { in: statuses as ClassSessionStatus[] },
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

function matchesAvailability(
  row: SessionListFilterRow,
  selected: readonly string[],
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const available = spotsLeft(row) > 0;
  const full = spotsLeft(row) === 0;
  return (
    (selected.includes('available') && available) ||
    (selected.includes('full') && full)
  );
}

function matchesTimeOfDay(
  row: SessionListFilterRow,
  selected: readonly string[],
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const hour = new Date(startsAtIso(row.startsAt)).getHours();
  return (
    (selected.includes('morning') && hour < 12) ||
    (selected.includes('afternoon') && hour >= 12 && hour < 17) ||
    (selected.includes('evening') && hour >= 17)
  );
}

function matchesQuickFilters(
  row: SessionListFilterRow,
  quick: readonly string[],
): boolean {
  if (quick.length === 0) {
    return true;
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  const rowDate = startsAtDateOnly(row.startsAt);

  const dateQuick = quick.filter(
    (item) => item === 'today' || item === 'thisWeek',
  );
  if (dateQuick.length > 0) {
    const matchesDate = dateQuick.some((item) =>
      item === 'today'
        ? rowDate === today
        : rowDate >= today && rowDate <= weekEnd,
    );
    if (!matchesDate) {
      return false;
    }
  }

  const availabilityQuick = quick.filter(
    (item) => item === 'available' || item === 'full',
  );
  if (availabilityQuick.length > 0) {
    const available = spotsLeft(row) > 0;
    const full = spotsLeft(row) === 0;
    const matches = availabilityQuick.some((item) =>
      item === 'available' ? available : full,
    );
    if (!matches) {
      return false;
    }
  }

  if (
    quick.includes('cancelled') &&
    row.status !== ClassSessionStatus.CANCELLED
  ) {
    return false;
  }
  if (
    quick.includes('beginner') &&
    !splitSessionLevels(row.level).includes('Beginner')
  ) {
    return false;
  }
  if (
    quick.includes('evening') &&
    new Date(startsAtIso(row.startsAt)).getHours() < 17
  ) {
    return false;
  }

  return true;
}

export function filterSessionRows<T extends SessionListFilterRow>(
  rows: T[],
  query: AdminListSessionsQueryDto,
): T[] {
  const levels = parseCsv(query.levels);
  const statuses = parseCsv(query.statuses);
  const availability = parseCsv(query.availability);
  const timeOfDay = parseCsv(query.timeOfDay);
  const quick = parseCsv(query.quick);
  const tokens = splitSearchTokens(query.q).map((token) => token.toLowerCase());
  const fromDay = query.from?.slice(0, 10);
  const toDay = query.to?.slice(0, 10) || fromDay;

  return rows.filter((row) => {
    if (tokens.length > 0) {
      const haystack =
        `${row.title} ${row.classType.name} ${coachDisplayName(row)}`.toLowerCase();
      if (!tokens.every((token) => haystack.includes(token))) {
        return false;
      }
    }
    const sessionDay = utcToStudioCalendarDate(new Date(startsAtIso(row.startsAt)));
    if (fromDay && sessionDay < fromDay) {
      return false;
    }
    if (toDay && sessionDay > toDay) {
      return false;
    }
    const coachIds = parseCsv(query.coachIds);
    if (coachIds.length > 0 && !coachIds.includes(row.coach.id)) {
      return false;
    }
    const classTypeIds = parseCsv(query.classTypeIds);
    if (classTypeIds.length > 0 && !classTypeIds.includes(row.classType.id)) {
      return false;
    }
    if (
      levels.length > 0 &&
      !splitSessionLevels(row.level).some((level) => levels.includes(level))
    ) {
      return false;
    }
    if (statuses.length > 0 && !statuses.includes(row.status)) {
      return false;
    }
    if (!matchesAvailability(row, availability)) {
      return false;
    }
    if (!matchesTimeOfDay(row, timeOfDay)) {
      return false;
    }
    return matchesQuickFilters(row, quick);
  });
}

export type AdminSessionsListPage<T> = {
  items: T[];
  total: number;
  take: number;
  offset: number;
  /** All matching session start times for date-strip day counts (not page-sliced). */
  dateStripStartsAt: string[];
};

function toStartsAtIso(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString();
}

export function paginateSessionRows<T extends { startsAt: string | Date }>(
  rows: T[],
  take: number,
  offset: number,
): AdminSessionsListPage<T> {
  return {
    items: rows.slice(offset, offset + take),
    total: rows.length,
    take,
    offset,
    dateStripStartsAt: rows.map((row) => toStartsAtIso(row.startsAt)),
  };
}

export function normalizeSessionsListQuery(
  query: AdminListSessionsQueryDto,
): AdminListSessionsQueryDto {
  const coachIds = [
    ...(query.coachIds
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []),
    ...(query.coachId ? [query.coachId] : []),
  ];
  const classTypeIds = [
    ...(query.classTypeIds
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []),
    ...(query.typeId ? [query.typeId] : []),
  ];
  const statuses = [
    ...(query.statuses
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []),
    ...(query.status ? [query.status] : []),
  ];
  const levels = [
    ...(query.levels
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []),
    ...(query.level ? [query.level] : []),
  ];

  return {
    ...query,
    coachIds:
      coachIds.length > 0 ? [...new Set(coachIds)].join(',') : query.coachIds,
    classTypeIds:
      classTypeIds.length > 0
        ? [...new Set(classTypeIds)].join(',')
        : query.classTypeIds,
    statuses:
      statuses.length > 0 ? [...new Set(statuses)].join(',') : query.statuses,
    levels: levels.length > 0 ? [...new Set(levels)].join(',') : query.levels,
  };
}
