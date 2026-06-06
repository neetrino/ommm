import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { parseListPageParams } from "@/lib/list-pagination";

export const ADMIN_SCHEDULE_LIST_PAGE_KEYS = {
  pageKey: "schedulePage",
  pageSizeKey: "schedulePageSize",
} as const;

export type AdminScheduleListPayload = {
  items: AdminScheduleSession[];
  total: number;
  take: number;
  offset: number;
};

export function buildAdminScheduleListEndpoint(take: number, offset: number): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/classes/admin/sessions?${params.toString()}`;
}

export function parseAdminScheduleListPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, ADMIN_SCHEDULE_LIST_PAGE_KEYS);
}

export function isScheduleListView(view: string | undefined): boolean {
  return view === undefined || view === "list";
}
