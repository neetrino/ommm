import type { Prisma } from '@prisma/client';
import {
  buildOpenEndedStudioDateTimeFilter,
  parseFilterCalendarDate,
} from '../common/studio-date-range';
import {
  addStudioCalendarDays,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';
import { splitSearchTokens } from '../common/token-text-search';
import type { AdminSalarySummariesQueryDto } from './dto/admin-salary-summaries-query.dto';
import type { SalaryPeriod } from './coaches-salary.helpers';

export const COACH_SALARY_FILTER_SCAN_LIMIT = 500;

const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH = /^\d{4}-\d{2}$/;

type SalarySummary = {
  totalEarningsCents: number;
  pendingPayoutCents: number;
} | null;

export type CoachSalaryRow = {
  coachProfileId: string;
  user: {
    name: string | null;
    lastName: string | null;
    phone: string | null;
    email: string;
  };
  salary: SalarySummary;
};

export type SalaryDateRangeQuery = {
  month?: string;
  from?: string;
  to?: string;
};

/**
 * Session `startsAt` filter for salary breakdowns.
 * Prefers inclusive `from`/`to` studio days; falls back to a half-open month window.
 */
export function resolveSalaryStartsAtFilter(
  query: SalaryDateRangeQuery,
): Prisma.DateTimeFilter {
  const fromDay = parseFilterCalendarDate(query.from);
  const toDay = parseFilterCalendarDate(query.to);
  if (fromDay || toDay) {
    return buildOpenEndedStudioDateTimeFilter(fromDay, toDay) ?? {};
  }
  const { from, to } = resolveSalaryMonthRange(query.month);
  return { gte: from, lt: to };
}

export function resolveSalaryMonthRange(month?: string): {
  from: Date;
  to: Date;
} {
  if (month && YEAR_MONTH.test(month)) {
    const [yearRaw, monthRaw] = month.split('-');
    const year = Number.parseInt(yearRaw, 10);
    const monthIndex = Number.parseInt(monthRaw, 10) - 1;
    const from = new Date(Date.UTC(year, monthIndex, 1));
    const to = new Date(Date.UTC(year, monthIndex + 1, 1));
    return { from, to };
  }
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { from, to };
}

/** Calendar months that intersect an inclusive from/to day range (or a legacy month). */
export function resolveSalaryPeriodsInQuery(
  query: SalaryDateRangeQuery,
  now: Date = new Date(),
): SalaryPeriod[] {
  const fromDay =
    parseFilterCalendarDate(query.from) ??
    (query.month && YEAR_MONTH.test(query.month)
      ? `${query.month}-01`
      : undefined);
  const toDay =
    parseFilterCalendarDate(query.to) ??
    (query.month && YEAR_MONTH.test(query.month)
      ? lastDayOfYearMonth(query.month)
      : undefined);

  if (!fromDay && !toDay) {
    const today = utcToStudioCalendarDate(now);
    return [periodFromDay(`${today.slice(0, 7)}-01`)];
  }

  const start = fromDay ?? toDay!;
  const end = toDay ?? fromDay!;
  const orderedStart = start <= end ? start : end;
  const orderedEnd = start <= end ? end : start;
  const periods: SalaryPeriod[] = [];
  let cursor = `${orderedStart.slice(0, 7)}-01`;
  const endMonth = orderedEnd.slice(0, 7);
  while (cursor.slice(0, 7) <= endMonth) {
    periods.push(periodFromDay(cursor));
    cursor = addStudioCalendarDays(lastDayOfYearMonth(cursor.slice(0, 7)), 1);
  }
  return periods;
}

function periodFromDay(day: string): SalaryPeriod {
  return {
    year: Number.parseInt(day.slice(0, 4), 10),
    month: Number.parseInt(day.slice(5, 7), 10),
  };
}

function lastDayOfYearMonth(yearMonth: string): string {
  const [yearRaw, monthRaw] = yearMonth.split('-');
  const year = Number.parseInt(yearRaw, 10);
  const monthIndex = Number.parseInt(monthRaw, 10) - 1;
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
}

export function isValidSalaryCalendarDay(value: string | undefined): boolean {
  return Boolean(value && CALENDAR_DAY.test(value));
}

export function requiresCoachSalaryPostProcessing(
  query: AdminSalarySummariesQueryDto,
): boolean {
  return Boolean(
    (query.payoutStatus && query.payoutStatus.length > 0) ||
    (query.quick && query.quick.length > 0) ||
    (query.order &&
      query.order !== 'newest' &&
      query.order !== 'highest-salary'),
  );
}

function displayName(row: CoachSalaryRow): string {
  return (
    [row.user.name, row.user.lastName].filter(Boolean).join(' ').trim() ||
    row.user.email
  );
}

export function payoutStatus(row: CoachSalaryRow): 'pending' | 'paid' | 'none' {
  if (!row.salary || row.salary.totalEarningsCents === 0) {
    return 'none';
  }
  if (row.salary.pendingPayoutCents > 0) {
    return 'pending';
  }
  return 'paid';
}

const HIGH_SALARY_EARNINGS_CENTS = 50_000;

function matchesSalaryQuickFilter(
  row: CoachSalaryRow,
  status: ReturnType<typeof payoutStatus>,
  quick: NonNullable<AdminSalarySummariesQueryDto['quick']>[number],
): boolean {
  if (quick === 'paid' || quick === 'recent-payments') {
    return status === 'paid';
  }
  if (quick === 'pending') {
    return status === 'pending';
  }
  if (quick === 'high-salary') {
    return (row.salary?.totalEarningsCents ?? 0) >= HIGH_SALARY_EARNINGS_CENTS;
  }
  return false;
}

export function filterCoachSalaryRows(
  rows: CoachSalaryRow[],
  query: AdminSalarySummariesQueryDto,
): CoachSalaryRow[] {
  const tokens = splitSearchTokens(query.search).map((token) =>
    token.toLowerCase(),
  );
  return rows.filter((row) => {
    if (tokens.length > 0) {
      const haystack =
        `${displayName(row)} ${row.user.phone ?? ''} ${row.user.email}`.toLowerCase();
      if (!tokens.every((token) => haystack.includes(token))) {
        return false;
      }
    }
    const status = payoutStatus(row);
    if (
      query.payoutStatus &&
      query.payoutStatus.length > 0 &&
      !query.payoutStatus.includes(status)
    ) {
      return false;
    }
    if (query.quick && query.quick.length > 0) {
      const matchesQuick = query.quick.some((quick) =>
        matchesSalaryQuickFilter(row, status, quick),
      );
      if (!matchesQuick) {
        return false;
      }
    }
    return true;
  });
}

export function sortCoachSalaryRows(
  rows: CoachSalaryRow[],
  order?: string,
): CoachSalaryRow[] {
  const copy = [...rows];
  if (order === 'oldest') {
    return copy.sort((a, b) =>
      a.coachProfileId.localeCompare(b.coachProfileId),
    );
  }
  return copy.sort(
    (a, b) =>
      (b.salary?.totalEarningsCents ?? 0) - (a.salary?.totalEarningsCents ?? 0),
  );
}
