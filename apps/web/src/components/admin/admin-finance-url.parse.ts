import {
  DEFAULT_FINANCE_OVERVIEW_RANGE,
  type CoachFinanceFilters,
  type CoachSalaryPayoutHistoryFilters,
  type FinanceBoundedDateRangeDays,
  type FinanceFilterValues,
  isFinancePaymentMethodValue,
} from "@/components/admin/admin-finance-types";
import { resolveFinanceCoachDefaultDateRange } from "@/components/admin/admin-finance-dates";
import { firstFinanceUrlParam } from "@/components/admin/admin-finance-url.helpers";
import { normalizeFilterDateValue } from "@/lib/filter-date-display";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";

const FINANCE_SOURCE_VALUES = new Set(["package", "dropin", "gift", "other"]);
const FINANCE_STATUS_VALUES = new Set([
  "SUCCEEDED",
  "FAILED",
  "PENDING",
  "REFUNDED",
]);

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

function financeCsvFromParam(
  value: string | string[] | undefined,
  allow: (part: string) => boolean,
): string {
  const raw = firstFinanceUrlParam(value)?.trim() ?? "";
  if (raw === "" || raw === "all") {
    return "all";
  }
  const selected = parseFilterMultiValue(raw).filter(allow);
  return selected.length === 0 ? "all" : selected.join(",");
}

export function parseFinanceSourceFilter(
  value: string | string[] | undefined,
): string {
  return financeCsvFromParam(value, (part) => FINANCE_SOURCE_VALUES.has(part));
}

export function parseFinanceStatusFilter(
  value: string | string[] | undefined,
): string {
  return financeCsvFromParam(value, (part) => FINANCE_STATUS_VALUES.has(part));
}

export function parseFinancePaymentMethodFilter(
  value: string | string[] | undefined,
): string {
  return financeCsvFromParam(value, isFinancePaymentMethodValue);
}

export function parseFinancePackagePlanFilter(
  value: string | string[] | undefined,
): string {
  return financeCsvFromParam(value, (part) => part.length > 0);
}

export function parseFinancePackageClassFilter(
  value: string | string[] | undefined,
): string {
  return financeCsvFromParam(value, (part) => part.length > 0);
}

export function parseFinancePackageSessionsFilter(
  value: string | string[] | undefined,
): string {
  return financeCsvFromParam(value, (part) => {
    if (part === "unlimited") {
      return true;
    }
    const parsed = Number.parseInt(part, 10);
    return Number.isInteger(parsed) && parsed > 0 && String(parsed) === part;
  });
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
