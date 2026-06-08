import { parseListPageParams } from "@/lib/list-pagination";
import {
  parseDateSortOrder,
  type DateSortOrder,
  type SessionSortOrder,
} from "@/lib/list-sort";

export type AdminWaitlistSortOrder = DateSortOrder | SessionSortOrder;

export type AdminWaitlistRow = {
  id: string;
  status: "ACTIVE" | "OFFERED" | "EXPIRED" | "CONVERTED" | "REMOVED";
  waitlistDate: string;
  sessionWaitlistCount: number;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    classType: { id: string; name: string };
  };
};

export type AdminWaitlistActivePayload = {
  items: AdminWaitlistRow[];
  total: number;
  take: number;
  offset: number;
};

export function parseAdminWaitlistSortOrder(
  value: string | undefined,
): AdminWaitlistSortOrder {
  if (!value) {
    return "newest";
  }
  if (
    value === "upcoming" ||
    value === "date-asc" ||
    value === "date-desc"
  ) {
    return value;
  }
  return parseDateSortOrder(value);
}

export function buildAdminWaitlistActiveEndpoint(
  take: number,
  offset: number,
  order: AdminWaitlistSortOrder = "newest",
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (order !== "newest") {
    params.set("order", order);
  }
  return `/waitlist/admin/active?${params.toString()}`;
}

export function parseAdminWaitlistPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search);
}
