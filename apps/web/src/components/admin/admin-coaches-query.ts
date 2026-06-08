import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { parseListPageParams } from "@/lib/list-pagination";

export type AdminCoachesFilterQuery = {
  q: string;
  specialization: string;
  classType: string;
  isActive: "all" | "active" | "inactive";
  order: "newest" | "oldest";
};

export type AdminCoachesListPayload = {
  items: AdminCoachDirectoryRow[];
  total: number;
  take: number;
  offset: number;
};

export function buildAdminCoachesListEndpoint(
  filters: AdminCoachesFilterQuery,
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
  if (filters.specialization.length > 0) {
    params.set("specialization", filters.specialization);
  }
  if (filters.classType.length > 0) {
    params.set("classType", filters.classType);
  }
  if (filters.isActive !== "all") {
    params.set("isActive", filters.isActive);
  }
  if (filters.order !== "newest") {
    params.set("order", filters.order);
  }
  return `/coaches/admin/list?${params.toString()}`;
}

export function parseAdminCoachesPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search);
}

export function pickAdminCoachesFilters(
  search: Record<string, string | undefined>,
): AdminCoachesFilterQuery {
  const isActive =
    search.isActive === "active" || search.isActive === "inactive"
      ? search.isActive
      : "all";
  return {
    q: search.q?.trim() ?? "",
    specialization: search.specialization?.trim() ?? "",
    classType: search.classType?.trim() ?? "",
    isActive,
    order: search.order === "oldest" ? "oldest" : "newest",
  };
}
