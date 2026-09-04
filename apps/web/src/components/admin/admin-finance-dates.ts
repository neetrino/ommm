import type { FinanceBoundedDateRangeDays } from "@/components/admin/admin-finance-types";
import { normalizeFilterDateValue } from "@/lib/filter-date-display";
import {
  addStudioCalendarDays,
  utcToStudioCalendarDate,
} from "@/lib/studio-timezone";

export type FinanceStudioDateRange = {
  from?: string;
  to?: string;
};

export type FinanceClosedStudioDateRange = {
  from: string;
  to: string;
};

export function resolveFinanceStudioDateRange(
  days: FinanceBoundedDateRangeDays,
  now: Date = new Date(),
): FinanceClosedStudioDateRange {
  const to = utcToStudioCalendarDate(now);
  const from = addStudioCalendarDays(to, 1 - days);
  return { from, to };
}

export function resolveFinancePaymentsDateRange(
  from: string,
  to: string,
): FinanceStudioDateRange {
  const fromDay = normalizeFilterDateValue(from);
  const toDay = normalizeFilterDateValue(to);
  const hasFrom = /^\d{4}-\d{2}-\d{2}$/.test(fromDay);
  const hasTo = /^\d{4}-\d{2}-\d{2}$/.test(toDay);
  if (!hasFrom && !hasTo) {
    return {};
  }
  if (hasFrom && hasTo && toDay < fromDay) {
    return { from: toDay, to: fromDay };
  }
  return {
    ...(hasFrom ? { from: fromDay } : {}),
    ...(hasTo ? { to: toDay } : {}),
  };
}

/** Period total is shown when a custom from/to date is set. */
export function hasFinancePaymentsPeriodSum(range: FinanceStudioDateRange): boolean {
  return Boolean(range.from || range.to);
}

export function resolveFinanceCurrentMonthRange(
  now: Date = new Date(),
): FinanceClosedStudioDateRange {
  const to = utcToStudioCalendarDate(now);
  return { from: `${to.slice(0, 7)}-01`, to };
}

export function applyFinanceStudioDateRangeParams(
  params: URLSearchParams,
  range: FinanceStudioDateRange,
): void {
  if (range.from) {
    params.set("from", range.from);
  }
  if (range.to) {
    params.set("to", range.to);
  }
}

export function buildFinanceDateRangeQuery(range: FinanceStudioDateRange): string {
  const params = new URLSearchParams();
  applyFinanceStudioDateRangeParams(params, range);
  return params.toString();
}
