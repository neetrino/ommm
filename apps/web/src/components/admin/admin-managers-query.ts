import { parseListPageParams } from "@/lib/list-pagination";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";
import type {
  AdminManagerOrder,
  AdminManagersFilterValues,
} from "@/components/admin/admin-managers-types";

export type { AdminManagersListPayload } from "@/components/admin/admin-managers-types";

const STATUS_VALUES = new Set(["active", "blocked"]);

export function buildAdminManagersListEndpoint(
  filters: AdminManagersFilterValues,
  take: number,
  offset: number,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (filters.q.length > 0) {
    params.set("q", filters.q);
  }
  const statusParts = parseFilterMultiValue(filters.status);
  if (statusParts.length > 0) {
    params.set("status", statusParts.join(","));
  }
  if (filters.order !== "newest") {
    params.set("order", filters.order);
  }
  return `/managers?${params.toString()}`;
}

export function parseAdminManagersPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search);
}

export function pickAdminManagersFilters(
  search: Record<string, string | undefined>,
): AdminManagersFilterValues {
  const statusParts = parseFilterMultiValue(search.status).filter((part) =>
    STATUS_VALUES.has(part),
  );
  const order: AdminManagerOrder = search.order === "oldest" ? "oldest" : "newest";
  return {
    q: search.q?.trim() ?? "",
    status: statusParts.length === 0 ? "all" : statusParts.join(","),
    order,
  };
}
