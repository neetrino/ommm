import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";
import { parseListPageParams } from "@/lib/list-pagination";

export type AdminCoachesFilterQuery = {
  q: string;
  specialization: string;
  classType: string;
  isActive: string;
  order: "newest" | "oldest";
};

export type AdminCoachesListPayload = {
  items: AdminCoachDirectoryRow[];
  total: number;
  take: number;
  offset: number;
};

const ACTIVE_VALUES = new Set(["active", "inactive"]);

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
  const classTypes = parseFilterMultiValue(filters.classType);
  if (classTypes.length > 0) {
    params.set("classType", classTypes.join(","));
  }
  const isActiveParts = parseFilterMultiValue(filters.isActive).filter((part) =>
    ACTIVE_VALUES.has(part),
  );
  if (isActiveParts.length > 0) {
    params.set("isActive", isActiveParts.join(","));
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
  const isActiveParts = parseFilterMultiValue(search.isActive).filter((part) =>
    ACTIVE_VALUES.has(part),
  );
  return {
    q: search.q?.trim() ?? "",
    specialization: search.specialization?.trim() ?? "",
    classType: search.classType?.trim() ?? "",
    isActive: isActiveParts.length === 0 ? "all" : isActiveParts.join(","),
    order: search.order === "oldest" ? "oldest" : "newest",
  };
}
