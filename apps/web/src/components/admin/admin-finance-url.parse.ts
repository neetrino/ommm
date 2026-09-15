import {
  DEFAULT_FINANCE_OVERVIEW_RANGE,
  type CoachFinanceFilters,
  type CoachSalaryPayoutHistoryFilters,
  type FinanceBoundedDateRangeDays,
  type FinanceFilterValues,
  type FinancePaymentMethodFilter,
  type FinanceSourceFilter,
  type FinanceStatusFilter,
  isFinancePaymentMethodValue,
} from "@/components/admin/admin-finance-types";
import { resolveFinanceCoachDefaultDateRange } from "@/components/admin/admin-finance-dates";
import { firstFinanceUrlParam } from "@/components/admin/admin-finance-url.helpers";
import { normalizeFilterDateValue } from "@/lib/filter-date-display";

export function parseFinanceDateRangeDays(
  value: string | string[] | undefined,
): FinanceBoundedDateRangeDays {
  const parsed = Number(firstFinanceUrlParam(value));
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed;
  }
  return DEFAULT_FINANCE_OVERVIEW_RANGE;
}

export function parseFinancePaymentsDateFilter(
  value: string | string[] | undefined,
): string {
  const normalized = normalizeFilterDateValue(firstFinanceUrlParam(value) ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

export function parseFinanceSourceFilter(
  value: string | string[] | undefined,
): FinanceSourceFilter {
  const raw = firstFinanceUrlParam(value) ?? "all";
  if (raw === "package" || raw === "dropin" || raw === "gift" || raw === "other") {
    return raw;
  }
  return "all";
}

export function parseFinanceStatusFilter(
  value: string | string[] | undefined,
): FinanceStatusFilter {
  const raw = firstFinanceUrlParam(value) ?? "all";
  if (
    raw === "SUCCEEDED" ||
    raw === "FAILED" ||
    raw === "PENDING" ||
    raw === "REFUNDED"
  ) {
    return raw;
  }
  return "all";
}

export function parseFinancePaymentMethodFilter(
  value: string | string[] | undefined,
): FinancePaymentMethodFilter {
  const raw = firstFinanceUrlParam(value);
  if (raw && isFinancePaymentMethodValue(raw)) {
    return raw;
  }
  return "all";
}

export function parseFinancePackagePlanFilter(
  value: string | string[] | undefined,
): FinanceFilterValues["planId"] {
  const raw = firstFinanceUrlParam(value)?.trim();
  return raw && raw !== "all" ? raw : "all";
}

export function parseFinancePackageClassFilter(
  value: string | string[] | undefined,
): FinanceFilterValues["packageClass"] {
  const raw = firstFinanceUrlParam(value)?.trim();
  return raw && raw !== "all" ? raw : "all";
}

export function parseFinancePackageSessionsFilter(
  value: string | string[] | undefined,
): FinanceFilterValues["sessions"] {
  const raw = firstFinanceUrlParam(value)?.trim();
  if (!raw || raw === "all") {
    return "all";
  }
  if (raw === "unlimited") {
    return "unlimited";
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isInteger(parsed) && parsed > 0) {
    return String(parsed);
  }
  return "all";
}

export function parseFinanceOverviewFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): { from: string; to: string } {
  return {
    from: parseFinancePaymentsDateFilter(search.from),
    to: parseFinancePaymentsDateFilter(search.to),
  };
}

export function parseFinancePaymentsFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): FinanceFilterValues {
  const order = firstFinanceUrlParam(search.order);
  return {
    q: firstFinanceUrlParam(search.q)?.trim() ?? "",
    from: parseFinancePaymentsDateFilter(search.from),
    to: parseFinancePaymentsDateFilter(search.to),
    source: parseFinanceSourceFilter(search.source),
    status: parseFinanceStatusFilter(search.status),
    paymentMethod: parseFinancePaymentMethodFilter(search.paymentMethod),
    planId: parseFinancePackagePlanFilter(search.planId),
    packageClass: parseFinancePackageClassFilter(search.packageClass),
    sessions: parseFinancePackageSessionsFilter(search.sessions),
    order: order === "oldest" ? "oldest" : "newest",
  };
}

function lastDayOfYearMonth(yearMonth: string): string {
  const [yearRaw, monthRaw] = yearMonth.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const monthIndex = Number.parseInt(monthRaw, 10) - 1;
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
}

export function parseFinanceCoachesFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): CoachFinanceFilters & { q: string } {
  const defaults = resolveFinanceCoachDefaultDateRange();
  const fromParam = parseFinancePaymentsDateFilter(search.from);
  const toParam = parseFinancePaymentsDateFilter(search.to);
  const legacyMonth = firstFinanceUrlParam(search.month);
  const order = firstFinanceUrlParam(search.order) ?? "newest";
  const validOrder =
    order === "oldest" || order === "newest" || order === "highest-salary"
      ? order
      : "newest";

  let from = fromParam;
  let to = toParam;
  if (!from && !to && legacyMonth && /^\d{4}-\d{2}$/.test(legacyMonth)) {
    from = `${legacyMonth}-01`;
    to =
      legacyMonth === defaults.to.slice(0, 7)
        ? defaults.to
        : lastDayOfYearMonth(legacyMonth);
  }
  if (!from && !to) {
    from = defaults.from;
    to = defaults.to;
  }

  return {
    q: firstFinanceUrlParam(search.q)?.trim() ?? "",
    search: firstFinanceUrlParam(search.q)?.trim() ?? "",
    from,
    to,
    payoutStatus: firstFinanceUrlParam(search.payoutStatus) ?? "",
    order: validOrder,
    quick: firstFinanceUrlParam(search.quick) ?? "",
  };
}

export function parseFinanceCoachPayoutHistoryFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): CoachSalaryPayoutHistoryFilters {
  const month = firstFinanceUrlParam(search.month);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return {
    month: month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth,
  };
}

/** @deprecated Use parseFinancePaymentsFiltersFromSearch. */
export function parseFinanceFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): FinanceFilterValues {
  return parseFinancePaymentsFiltersFromSearch(search);
}
