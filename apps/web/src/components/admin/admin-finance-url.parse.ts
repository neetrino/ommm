import type {
  CoachFinanceFilters,
  FinanceDateRangeDays,
  FinanceFilterValues,
  FinanceSourceFilter,
  FinanceStatusFilter,
  UserFinanceFilters,
} from "@/components/admin/admin-finance-types";
import { firstFinanceUrlParam } from "@/components/admin/admin-finance-url.helpers";

export function parseFinanceDateRangeDays(
  value: string | string[] | undefined,
): FinanceDateRangeDays {
  const parsed = Number(firstFinanceUrlParam(value));
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed;
  }
  return 30;
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
): Pick<FinanceFilterValues, "rangeDays"> {
  return {
    rangeDays: parseFinanceDateRangeDays(search.rangeDays),
  };
}

export function parseFinancePaymentsFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): FinanceFilterValues {
  const order = firstFinanceUrlParam(search.order);
  return {
    q: firstFinanceUrlParam(search.q)?.trim() ?? "",
    rangeDays: parseFinanceDateRangeDays(search.rangeDays),
    source: parseFinanceSourceFilter(search.source),
    status: parseFinanceStatusFilter(search.status),
    planId: parseFinancePackagePlanFilter(search.planId),
    packageClass: parseFinancePackageClassFilter(search.packageClass),
    sessions: parseFinancePackageSessionsFilter(search.sessions),
    order: order === "oldest" ? "oldest" : "newest",
  };
}

export function parseFinanceMembersFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): UserFinanceFilters & { q: string } {
  const order = firstFinanceUrlParam(search.order) ?? "newest";
  const validOrder =
    order === "oldest" ||
    order === "newest" ||
    order === "highest-lifetime-value" ||
    order === "lowest-lifetime-value"
      ? order
      : "newest";

  return {
    q: firstFinanceUrlParam(search.q)?.trim() ?? "",
    search: firstFinanceUrlParam(search.q)?.trim() ?? "",
    paymentStatus: firstFinanceUrlParam(search.paymentStatus) ?? "",
    giftCardOnly: firstFinanceUrlParam(search.giftCardOnly) === "true",
    order: validOrder,
    quick: firstFinanceUrlParam(search.quick) ?? "",
  };
}

export function parseFinanceCoachesFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): CoachFinanceFilters & { q: string } {
  const month = firstFinanceUrlParam(search.month);
  const order = firstFinanceUrlParam(search.order) ?? "newest";
  const validOrder =
    order === "oldest" || order === "newest" || order === "highest-salary"
      ? order
      : "newest";

  return {
    q: firstFinanceUrlParam(search.q)?.trim() ?? "",
    search: firstFinanceUrlParam(search.q)?.trim() ?? "",
    month: month && /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7),
    payoutStatus: firstFinanceUrlParam(search.payoutStatus) ?? "",
    order: validOrder,
    quick: firstFinanceUrlParam(search.quick) ?? "",
  };
}

/** @deprecated Use parseFinancePaymentsFiltersFromSearch. */
export function parseFinanceFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): FinanceFilterValues {
  return parseFinancePaymentsFiltersFromSearch(search);
}
