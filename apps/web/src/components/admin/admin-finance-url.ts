import {
  FINANCE_SECTION_HREF,
  type FinanceSectionId,
} from "@/components/admin/admin-finance-module";
import type {
  CoachFinanceFilters,
  FinanceDateRangeDays,
  FinanceFilterValues,
  FinanceSourceFilter,
  FinanceStatusFilter,
  UserFinanceFilters,
} from "@/components/admin/admin-finance-types";

export const FINANCE_OVERVIEW_QUERY_KEYS = ["rangeDays"] as const;

export const FINANCE_PAYMENTS_QUERY_KEYS = [
  "q",
  "rangeDays",
  "source",
  "status",
  "payPage",
  "payPageSize",
] as const;

export const FINANCE_MEMBERS_QUERY_KEYS = [
  "q",
  "paymentStatus",
  "order",
  "giftCardOnly",
  "quick",
  "userPage",
  "userPageSize",
] as const;

export const FINANCE_COACHES_QUERY_KEYS = [
  "q",
  "month",
  "payoutStatus",
  "order",
  "quick",
  "coachPage",
  "coachPageSize",
] as const;

/** @deprecated Use tab-specific query keys. */
export const FINANCE_FILTER_QUERY_KEYS = FINANCE_PAYMENTS_QUERY_KEYS;

export const FINANCE_USER_PAGE_KEYS = {
  pageKey: "userPage",
  pageSizeKey: "userPageSize",
} as const;

export const FINANCE_PAYMENTS_PAGE_KEYS = {
  pageKey: "payPage",
  pageSizeKey: "payPageSize",
} as const;

export const FINANCE_COACH_PAGE_KEYS = {
  pageKey: "coachPage",
  pageSizeKey: "coachPageSize",
} as const;

export const FINANCE_LEGACY_QUERY_KEYS = ["tab"] as const;

export const FINANCE_ALL_QUERY_KEYS = [
  ...new Set([
    ...FINANCE_OVERVIEW_QUERY_KEYS,
    ...FINANCE_PAYMENTS_QUERY_KEYS,
    ...FINANCE_MEMBERS_QUERY_KEYS,
    ...FINANCE_COACHES_QUERY_KEYS,
    ...FINANCE_LEGACY_QUERY_KEYS,
  ]),
] as const;

/** Query keys allowed on a finance tab route. */
export function getFinanceSectionQueryKeys(section: FinanceSectionId): readonly string[] {
  switch (section) {
    case "overview":
      return FINANCE_OVERVIEW_QUERY_KEYS;
    case "payments":
      return FINANCE_PAYMENTS_QUERY_KEYS;
    case "members":
      return FINANCE_MEMBERS_QUERY_KEYS;
    case "coaches":
      return FINANCE_COACHES_QUERY_KEYS;
  }
}

function pickFinanceSectionParams(
  allowedKeys: readonly string[],
  source: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of allowedKeys) {
    const value = source.get(key);
    if (value !== null && value !== "") {
      params.set(key, value);
    }
  }
  return params;
}

/** Preserves section-allowed query keys when switching finance tabs. */
export function buildFinanceTabHref(
  section: FinanceSectionId,
  search: Record<string, string | string[] | undefined>,
): string {
  const base = FINANCE_SECTION_HREF[section];
  const query = buildSanitizedFinanceSectionQueryString(section, search);
  return query.length > 0 ? `${base}?${query}` : base;
}

/** Builds a query string containing only keys valid for the given finance tab. */
export function buildSanitizedFinanceSectionQueryString(
  section: FinanceSectionId,
  search: Record<string, string | string[] | undefined>,
): string {
  const allowed = new Set(getFinanceSectionQueryKeys(section));
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (!allowed.has(key)) {
      continue;
    }
    const normalized = firstParam(value);
    if (normalized !== undefined && normalized !== "") {
      params.set(key, normalized);
    }
  }
  return params.toString();
}

/** True when URL contains legacy or foreign finance query keys for this tab. */
export function financeSectionSearchNeedsSanitization(
  section: FinanceSectionId,
  search: Record<string, string | string[] | undefined>,
): boolean {
  const allowed = new Set<string>([
    ...getFinanceSectionQueryKeys(section),
    ...FINANCE_LEGACY_QUERY_KEYS,
  ]);
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined) {
      continue;
    }
    const normalized = firstParam(value);
    if (normalized === undefined || normalized === "") {
      continue;
    }
    if (!allowed.has(key)) {
      return true;
    }
  }
  return firstParam(search.tab) !== undefined;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseFinanceDateRangeDays(
  value: string | string[] | undefined,
): FinanceDateRangeDays {
  const parsed = Number(firstParam(value));
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed;
  }
  return 30;
}

export function parseFinanceSourceFilter(
  value: string | string[] | undefined,
): FinanceSourceFilter {
  const raw = firstParam(value) ?? "all";
  if (raw === "package" || raw === "dropin" || raw === "gift" || raw === "other") {
    return raw;
  }
  return "all";
}

export function parseFinanceStatusFilter(
  value: string | string[] | undefined,
): FinanceStatusFilter {
  const raw = firstParam(value) ?? "all";
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
  return {
    q: firstParam(search.q)?.trim() ?? "",
    rangeDays: parseFinanceDateRangeDays(search.rangeDays),
    source: parseFinanceSourceFilter(search.source),
    status: parseFinanceStatusFilter(search.status),
  };
}

export function parseFinanceMembersFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): UserFinanceFilters & { q: string } {
  const order = firstParam(search.order) ?? "newest";
  const validOrder =
    order === "oldest" ||
    order === "newest" ||
    order === "highest-lifetime-value" ||
    order === "lowest-lifetime-value"
      ? order
      : "newest";

  return {
    q: firstParam(search.q)?.trim() ?? "",
    search: firstParam(search.q)?.trim() ?? "",
    paymentStatus: firstParam(search.paymentStatus) ?? "",
    giftCardOnly: firstParam(search.giftCardOnly) === "true",
    order: validOrder,
    quick: firstParam(search.quick) ?? "",
  };
}

export function parseFinanceCoachesFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): CoachFinanceFilters & { q: string } {
  const month = firstParam(search.month);
  const order = firstParam(search.order) ?? "newest";
  const validOrder =
    order === "oldest" || order === "newest" || order === "highest-salary"
      ? order
      : "newest";

  return {
    q: firstParam(search.q)?.trim() ?? "",
    search: firstParam(search.q)?.trim() ?? "",
    month: month && /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7),
    payoutStatus: firstParam(search.payoutStatus) ?? "",
    order: validOrder,
    quick: firstParam(search.quick) ?? "",
  };
}

/** @deprecated Use parseFinancePaymentsFiltersFromSearch. */
export function parseFinanceFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): FinanceFilterValues {
  return parseFinancePaymentsFiltersFromSearch(search);
}

function applyQueryKeys(
  params: URLSearchParams,
  keys: readonly string[],
  values: Record<string, string | undefined>,
): void {
  for (const key of keys) {
    params.delete(key);
  }
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
}

export function buildFinanceOverviewFiltersQuery(
  rangeDays: FinanceDateRangeDays,
  currentSearchParams: URLSearchParams,
): string {
  const params = pickFinanceSectionParams([...FINANCE_OVERVIEW_QUERY_KEYS], currentSearchParams);
  applyQueryKeys(params, [...FINANCE_OVERVIEW_QUERY_KEYS], {
    rangeDays: rangeDays === 30 ? undefined : String(rangeDays),
  });
  return params.toString();
}

export function buildFinancePaymentsFiltersQuery(
  values: FinanceFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  const params = pickFinanceSectionParams([...FINANCE_PAYMENTS_QUERY_KEYS], currentSearchParams);
  applyQueryKeys(params, [...FINANCE_PAYMENTS_QUERY_KEYS], {
    q: values.q.trim() !== "" ? values.q.trim() : undefined,
    rangeDays: values.rangeDays !== 30 ? String(values.rangeDays) : undefined,
    source: values.source !== "all" ? values.source : undefined,
    status: values.status !== "all" ? values.status : undefined,
  });
  return params.toString();
}

export function buildFinanceMembersFiltersQuery(
  values: UserFinanceFilters & { q?: string },
  currentSearchParams: URLSearchParams,
): string {
  const q = (values.q ?? values.search).trim();
  const params = pickFinanceSectionParams([...FINANCE_MEMBERS_QUERY_KEYS], currentSearchParams);
  applyQueryKeys(params, [...FINANCE_MEMBERS_QUERY_KEYS], {
    q: q !== "" ? q : undefined,
    paymentStatus: values.paymentStatus !== "" ? values.paymentStatus : undefined,
    order: values.order !== "newest" ? values.order : undefined,
    giftCardOnly: values.giftCardOnly ? "true" : undefined,
    quick: values.quick !== "" ? values.quick : undefined,
  });
  return params.toString();
}

export function buildFinanceCoachesFiltersQuery(
  values: CoachFinanceFilters & { q?: string },
  currentSearchParams: URLSearchParams,
): string {
  const q = (values.q ?? values.search).trim();
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const params = pickFinanceSectionParams([...FINANCE_COACHES_QUERY_KEYS], currentSearchParams);
  applyQueryKeys(params, [...FINANCE_COACHES_QUERY_KEYS], {
    q: q !== "" ? q : undefined,
    month: values.month !== defaultMonth ? values.month : undefined,
    payoutStatus: values.payoutStatus !== "" ? values.payoutStatus : undefined,
    order: values.order !== "newest" ? values.order : undefined,
    quick: values.quick !== "" ? values.quick : undefined,
  });
  return params.toString();
}

/** Builds paginated members list API query with finance tab filters applied server-side. */
export function buildFinanceMembersClientsQuery(
  filters: UserFinanceFilters & { q?: string },
  listPage: { take: number; offset: number },
): string {
  const params = new URLSearchParams({
    meta: "true",
    take: String(listPage.take),
    offset: String(listPage.offset),
  });
  const search = (filters.q ?? filters.search).trim();
  if (search) {
    params.set("search", search);
  }
  if (filters.quick === "paid") {
    params.set("paymentStatus", "paid");
  } else if (filters.quick === "pending") {
    params.set("paymentStatus", "unpaid");
  } else if (filters.quick === "overdue") {
    params.set("paymentStatus", "overdue");
  } else if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
  }
  if (filters.quick === "active") {
    params.set("status", "active");
  }
  if (filters.quick === "gift-card" || filters.giftCardOnly) {
    params.set("giftCardOnly", "true");
  }
  if (filters.order) {
    params.set("order", filters.order);
  }
  return `/clients?${params.toString()}`;
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
