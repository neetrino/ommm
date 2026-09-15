import {
  applyFinanceStudioDateRangeParams,
  resolveFinanceCoachDefaultDateRange,
  resolveFinancePaymentsDateRange,
  type FinanceStudioDateRange,
} from "@/components/admin/admin-finance-dates";
import {
  type CoachFinanceFilters,
  type CoachSalaryPayoutHistoryFilters,
  type FinanceFilterValues,
} from "@/components/admin/admin-finance-types";
import {
  FINANCE_COACHES_QUERY_KEYS,
  FINANCE_OVERVIEW_QUERY_KEYS,
  FINANCE_PAYMENTS_QUERY_KEYS,
} from "@/components/admin/admin-finance-url.constants";
import {
  applyFinanceQueryKeys,
  pickFinanceSectionParams,
} from "@/components/admin/admin-finance-url.helpers";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";

function financeMultiOrUndefined(value: string): string | undefined {
  const parts = parseFilterMultiValue(value);
  return parts.length > 0 ? parts.join(",") : undefined;
}

export function buildFinanceOverviewFiltersQuery(
  values: { from: string; to: string },
  currentSearchParams: URLSearchParams,
): string {
  const params = pickFinanceSectionParams([...FINANCE_OVERVIEW_QUERY_KEYS], currentSearchParams);
  applyFinanceQueryKeys(params, [...FINANCE_OVERVIEW_QUERY_KEYS], {
    from: values.from.trim() !== "" ? values.from.trim() : undefined,
    to: values.to.trim() !== "" ? values.to.trim() : undefined,
  });
  return params.toString();
}

export function buildFinancePaymentsFiltersQuery(
  values: FinanceFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  const params = pickFinanceSectionParams([...FINANCE_PAYMENTS_QUERY_KEYS], currentSearchParams);
  applyFinanceQueryKeys(params, [...FINANCE_PAYMENTS_QUERY_KEYS], {
    q: values.q.trim() !== "" ? values.q.trim() : undefined,
    from: values.from.trim() !== "" ? values.from.trim() : undefined,
    to: values.to.trim() !== "" ? values.to.trim() : undefined,
    source: financeMultiOrUndefined(values.source),
    status: financeMultiOrUndefined(values.status),
    paymentMethod: financeMultiOrUndefined(values.paymentMethod),
    planId: financeMultiOrUndefined(values.planId),
    packageClass: financeMultiOrUndefined(values.packageClass),
    sessions: financeMultiOrUndefined(values.sessions),
    order: values.order !== "newest" ? values.order : undefined,
  });
  return params.toString();
}

/** Builds the admin payments list API query with finance tab filters applied server-side. */
export function buildFinancePaymentsAdminApiQuery(
  filters: FinanceFilterValues,
  range: FinanceStudioDateRange,
  listPage: { take: number; offset: number },
): string {
  const params = new URLSearchParams({
    take: String(listPage.take),
    offset: String(listPage.offset),
  });
  applyFinanceStudioDateRangeParams(params, range);
  const status = financeMultiOrUndefined(filters.status);
  if (status) {
    params.set("status", status);
  }
  const source = financeMultiOrUndefined(filters.source);
  if (source) {
    params.set("source", source);
  }
  const paymentMethod = financeMultiOrUndefined(filters.paymentMethod);
  if (paymentMethod) {
    params.set("paymentMethod", paymentMethod);
  }
  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  const planId = financeMultiOrUndefined(filters.planId);
  if (planId) {
    params.set("planId", planId);
  }
  const packageClass = financeMultiOrUndefined(filters.packageClass);
  if (packageClass) {
    params.set("packageClass", packageClass);
  }
  const sessions = financeMultiOrUndefined(filters.sessions);
  if (sessions) {
    params.set("sessions", sessions);
  }
  if (filters.order !== "newest") {
    params.set("order", filters.order);
  }
  return `/payments/admin?${params.toString()}`;
}

export function buildFinanceCoachesFiltersQuery(
  values: CoachFinanceFilters & { q?: string },
  currentSearchParams: URLSearchParams,
): string {
  const q = (values.q ?? values.search).trim();
  const defaults = resolveFinanceCoachDefaultDateRange();
  const range = resolveFinancePaymentsDateRange(values.from, values.to);
  const from = range.from ?? "";
  const to = range.to ?? "";
  const params = pickFinanceSectionParams([...FINANCE_COACHES_QUERY_KEYS], currentSearchParams);
  applyFinanceQueryKeys(params, [...FINANCE_COACHES_QUERY_KEYS], {
    q: q !== "" ? q : undefined,
    from: from && from !== defaults.from ? from : undefined,
    to: to && to !== defaults.to ? to : undefined,
    month: undefined,
    payoutStatus: values.payoutStatus !== "" ? values.payoutStatus : undefined,
    order: values.order !== "newest" ? values.order : undefined,
    quick: values.quick !== "" ? values.quick : undefined,
  });
  return params.toString();
}

export function buildFinanceCoachSalaryQuery(
  filters: CoachFinanceFilters & { q?: string },
  listPage: { take: number; offset: number },
): string {
  const params = new URLSearchParams({
    take: String(listPage.take),
    offset: String(listPage.offset),
  });
  const search = (filters.q ?? filters.search).trim();
  if (search) {
    params.set("search", search);
  }
  const range = resolveFinancePaymentsDateRange(filters.from, filters.to);
  applyFinanceStudioDateRangeParams(params, range);
  if (filters.payoutStatus) {
    params.set("payoutStatus", filters.payoutStatus);
  }
  if (filters.order && filters.order !== "newest") {
    params.set("order", filters.order);
  }
  if (filters.quick) {
    params.set("quick", filters.quick);
  }
  return `/coaches/admin/salary-summaries?${params.toString()}`;
}

export function buildFinanceCoachPayoutHistoryApiQuery(
  filters: CoachSalaryPayoutHistoryFilters,
  listPage: { take: number; offset: number },
): string {
  const params = new URLSearchParams({
    take: String(listPage.take),
    offset: String(listPage.offset),
  });
  if (filters.month) {
    params.set("month", filters.month);
  }
  return `/coaches/admin/salary-payouts?${params.toString()}`;
}

/** @deprecated Use buildFinancePaymentsFiltersQuery. */
export function buildFinanceFiltersQuery(
  values: FinanceFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  return buildFinancePaymentsFiltersQuery(values, currentSearchParams);
}
