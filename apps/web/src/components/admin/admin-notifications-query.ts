import type {
  AdminNotificationsListPayload,
  DeliveryRow,
  ScheduledBroadcast,
} from "@/components/admin/admin-notifications-types";
import { parseListPageParams } from "@/lib/list-pagination";
import type {
  DeliveriesListFilters,
  ScheduledListFilters,
} from "@/components/admin/admin-notifications-url";
import {
  deliveriesFiltersToApiParams,
  scheduledFiltersToApiParams,
} from "@/components/admin/admin-notifications-url";

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
  filters?: ScheduledListFilters,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (filters) {
    for (const [key, value] of scheduledFiltersToApiParams(filters)) {
      params.set(key, value);
    }
  }
  return `/notifications/admin/scheduled?${params.toString()}`;
}

export function buildAdminNotificationsDeliveriesEndpoint(
  take: number,
  offset: number,
  filters?: DeliveriesListFilters,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (filters) {
    for (const [key, value] of deliveriesFiltersToApiParams(filters)) {
      params.set(key, value);
    }
  }
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
