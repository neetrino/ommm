import { ClassSessionStatus, Prisma } from '@prisma/client';
import { buildOpenEndedStudioDateTimeFilter } from '../common/studio-date-range';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

/** Local calendar day bounds — shared by dashboard stats and today's class list. */
export function getLocalDayBounds(referenceDate: Date = new Date()): {
  todayStart: Date;
  todayEnd: Date;
} {
  const todayStart = new Date(referenceDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  return { todayStart, todayEnd };
}

export function buildTodaySessionsWhere(
  todayStart: Date,
  todayEnd: Date,
): Prisma.ClassSessionWhereInput {
  return {
    startsAt: { gte: todayStart, lt: todayEnd },
    status: { not: ClassSessionStatus.CANCELLED },
  };
}

export function getMonthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function getNextMonthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export function getPreviousMonthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
}

export function joinName(
  firstName: string | null,
  lastName: string | null,
  fallback: string,
): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName.length > 0 ? fullName : fallback;
}

export function resolveRange(input: DateRangeQueryDto): {
  from: string;
  to: string;
} {
  const to = input.to ? new Date(input.to) : new Date();
  const from = input.from
    ? new Date(input.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function resolveRelativeDays(days: number): { from: Date; to: Date } {
  const safeDays = Math.max(1, days);
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - safeDays + 1);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

export function buildPaymentDateFilter(
  range: DateRangeQueryDto,
): Prisma.DateTimeFilter | undefined {
  return buildOpenEndedStudioDateTimeFilter(range.from, range.to);
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function detectPaymentSource(
  description: string | null,
): 'package' | 'dropin' | 'gift' | 'other' {
  const normalized = (description ?? '').toLowerCase();
  if (normalized.startsWith('membership') || normalized.startsWith('package')) {
    return 'package';
  }
  if (normalized.startsWith('drop-in')) {
    return 'dropin';
  }
  if (normalized.startsWith('gift')) {
    return 'gift';
  }
  return 'other';
}

export function countBySessionId(
  items: Array<{ sessionId: string }>,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items) {
    result.set(item.sessionId, (result.get(item.sessionId) ?? 0) + 1);
  }
  return result;
}

export function readGiftAmount(card: {
  amountCents?: number;
  amountAmd?: number;
}): number {
  if (typeof card.amountAmd === 'number') {
    return card.amountAmd;
  }
  return card.amountCents ?? 0;
}

export function toCsvRow(cells: ReadonlyArray<string | number>): string {
  return cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
}
