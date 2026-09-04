import {
  applyFinanceStudioDateRangeParams,
  type FinanceStudioDateRange,
} from "@/components/admin/admin-finance-dates";
import {
  DEFAULT_FINANCE_OVERVIEW_RANGE,
  type CoachFinanceFilters,
  type FinanceBoundedDateRangeDays,
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

export function buildFinanceOverviewFiltersQuery(
  rangeDays: FinanceBoundedDateRangeDays,
  currentSearchParams: URLSearchParams,
): string {
  const params = pickFinanceSectionParams([...FINANCE_OVERVIEW_QUERY_KEYS], currentSearchParams);
  applyFinanceQueryKeys(params, [...FINANCE_OVERVIEW_QUERY_KEYS], {
    rangeDays: rangeDays === DEFAULT_FINANCE_OVERVIEW_RANGE ? undefined : String(rangeDays),
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
    rangeDays: values.rangeDays !== "all" ? String(values.rangeDays) : undefined,
    source: values.source !== "all" ? values.source : undefined,
    status: values.status !== "all" ? values.status : undefined,
    paymentMethod: values.paymentMethod !== "all" ? values.paymentMethod : undefined,
    planId: values.planId !== "all" ? values.planId : undefined,
    packageClass: values.packageClass !== "all" ? values.packageClass : undefined,
    sessions: values.sessions !== "all" ? values.sessions : undefined,
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
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.source !== "all") {
    params.set("source", filters.source);
  }
  if (filters.paymentMethod !== "all") {
    params.set("paymentMethod", filters.paymentMethod);
  }
  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.planId !== "all") {
    params.set("planId", filters.planId);
  }
  if (filters.packageClass !== "all") {
    params.set("packageClass", filters.packageClass);
  }
  if (filters.sessions !== "all") {
    params.set("sessions", filters.sessions);
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
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const params = pickFinanceSectionParams([...FINANCE_COACHES_QUERY_KEYS], currentSearchParams);
  applyFinanceQueryKeys(params, [...FINANCE_COACHES_QUERY_KEYS], {
    q: q !== "" ? q : undefined,
    month: values.month !== defaultMonth ? values.month : undefined,
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
  if (filters.month) {
    params.set("month", filters.month);
  }
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

/** @deprecated Use buildFinancePaymentsFiltersQuery. */
export function buildFinanceFiltersQuery(
  values: FinanceFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  return buildFinancePaymentsFiltersQuery(values, currentSearchParams);
}
