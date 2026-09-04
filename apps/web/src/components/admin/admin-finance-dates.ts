import type {
  FinanceBoundedDateRangeDays,
  FinanceDateRangeDays,
} from "@/components/admin/admin-finance-types";
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
  rangeDays: FinanceDateRangeDays,
  now: Date = new Date(),
): FinanceStudioDateRange {
  if (rangeDays === "all") {
    return {};
  }
  return resolveFinanceStudioDateRange(rangeDays, now);
}

/** Period total is shown only when a bounded range is selected. */
export function hasFinancePaymentsPeriodSum(rangeDays: FinanceDateRangeDays): boolean {
  return rangeDays !== "all";
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
