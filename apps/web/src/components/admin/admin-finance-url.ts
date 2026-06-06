import type {
  FinanceDateRangeDays,
  FinanceFilterValues,
  FinanceSourceFilter,
  FinanceStatusFilter,
} from "@/components/admin/admin-finance-types";

export const FINANCE_FILTER_QUERY_KEYS = ["q", "rangeDays", "source", "status"] as const;

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

export function parseFinanceFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): FinanceFilterValues {
  return {
    q: firstParam(search.q)?.trim() ?? "",
    rangeDays: parseFinanceDateRangeDays(search.rangeDays),
    source: parseFinanceSourceFilter(search.source),
    status: parseFinanceStatusFilter(search.status),
  };
}

export function buildFinanceFiltersQuery(
  values: FinanceFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(currentSearchParams.toString());
  for (const key of FINANCE_FILTER_QUERY_KEYS) {
    params.delete(key);
  }
  if (values.q.trim() !== "") {
    params.set("q", values.q.trim());
  }
  if (values.rangeDays !== 30) {
    params.set("rangeDays", String(values.rangeDays));
  }
  if (values.source !== "all") {
    params.set("source", values.source);
  }
  if (values.status !== "all") {
    params.set("status", values.status);
  }
  return params.toString();
}
