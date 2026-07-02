import {
  FINANCE_SECTION_HREF,
  type FinanceSectionId,
} from "@/components/admin/admin-finance-module";
import {
  FINANCE_LEGACY_QUERY_KEYS,
  getFinanceSectionQueryKeys,
} from "@/components/admin/admin-finance-url.constants";

export function firstFinanceUrlParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function pickFinanceSectionParams(
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

export function applyFinanceQueryKeys(
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
    const normalized = firstFinanceUrlParam(value);
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
    const normalized = firstFinanceUrlParam(value);
    if (normalized === undefined || normalized === "") {
      continue;
    }
    if (!allowed.has(key)) {
      return true;
    }
  }
  return firstFinanceUrlParam(search.tab) !== undefined;
}
