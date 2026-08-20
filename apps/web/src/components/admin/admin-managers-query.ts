import { parseListPageParams } from "@/lib/list-pagination";
import type {
  AdminManagerOrder,
  AdminManagersFilterValues,
  AdminManagerStatusFilter,
} from "@/components/admin/admin-managers-types";

export type { AdminManagersListPayload } from "@/components/admin/admin-managers-types";

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
  if (filters.status !== "all") {
    params.set("status", filters.status);
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
  const status: AdminManagerStatusFilter =
    search.status === "active" || search.status === "blocked"
      ? search.status
      : "all";
  const order: AdminManagerOrder = search.order === "oldest" ? "oldest" : "newest";
  return {
    q: search.q?.trim() ?? "",
    status,
    order,
  };
}
