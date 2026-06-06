import type {
  AdminNotificationsListPayload,
  DeliveryRow,
  ScheduledBroadcast,
} from "@/components/admin/admin-notifications-types";
import { parseListPageParams } from "@/lib/list-pagination";

export type { AdminNotificationsListPayload } from "@/components/admin/admin-notifications-types";

export const ADMIN_NOTIFICATIONS_SCHEDULED_PAGE_KEYS = {
  pageKey: "scheduledPage",
  pageSizeKey: "scheduledPageSize",
} as const;

export const ADMIN_NOTIFICATIONS_DELIVERIES_PAGE_KEYS = {
  pageKey: "deliveriesPage",
  pageSizeKey: "deliveriesPageSize",
} as const;

export function buildAdminNotificationsScheduledEndpoint(
  take: number,
  offset: number,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/notifications/admin/scheduled?${params.toString()}`;
}

export function buildAdminNotificationsDeliveriesEndpoint(
  take: number,
  offset: number,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/notifications/admin/deliveries?${params.toString()}`;
}

export function parseAdminNotificationsScheduledPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, ADMIN_NOTIFICATIONS_SCHEDULED_PAGE_KEYS);
}

export function parseAdminNotificationsDeliveriesPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, ADMIN_NOTIFICATIONS_DELIVERIES_PAGE_KEYS);
}
