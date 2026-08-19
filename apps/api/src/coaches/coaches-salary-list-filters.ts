import { splitSearchTokens } from '../common/token-text-search';
import type { AdminSalarySummariesQueryDto } from './dto/admin-salary-summaries-query.dto';

export const COACH_SALARY_FILTER_SCAN_LIMIT = 500;

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

export function resolveSalaryMonthRange(month?: string): {
  from: Date;
  to: Date;
} {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
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

export function requiresCoachSalaryPostProcessing(
  query: AdminSalarySummariesQueryDto,
): boolean {
  return Boolean(
    query.payoutStatus ||
    query.quick ||
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

export function filterCoachSalaryRows(
  rows: CoachSalaryRow[],
  query: AdminSalarySummariesQueryDto,
): CoachSalaryRow[] {
  const tokens = splitSearchTokens(query.search).map((token) => token.toLowerCase());
  return rows.filter((row) => {
    if (tokens.length > 0) {
      const haystack =
        `${displayName(row)} ${row.user.phone ?? ''} ${row.user.email}`.toLowerCase();
      if (!tokens.every((token) => haystack.includes(token))) {
        return false;
      }
    }
    const status = payoutStatus(row);
    if (query.payoutStatus && status !== query.payoutStatus) {
      return false;
    }
    if (query.quick === 'paid' && status !== 'paid') return false;
    if (query.quick === 'pending' && status !== 'pending') return false;
    if (query.quick === 'high-salary') {
      const earnings = row.salary?.totalEarningsCents ?? 0;
      if (earnings < 50000) return false;
    }
    if (query.quick === 'recent-payments' && status !== 'paid') return false;
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
