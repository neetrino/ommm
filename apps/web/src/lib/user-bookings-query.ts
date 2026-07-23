import type { UserBookingRow } from "@/lib/user-booking-types";
import type { SessionSortOrder } from "@/lib/list-sort";

export const USER_BOOKINGS_PAST_PAGE_KEYS = {
  pageKey: "pastPage",
  pageSizeKey: "pastPageSize",
} as const;

export type UserBookingsPastPayload = {
  rows: UserBookingRow[];
  total: number;
  take: number;
  offset: number;
};

export function buildUserBookingsPastEndpoint(
  take: number,
  offset: number,
  order: SessionSortOrder = "date-desc",
): string {
  const params = new URLSearchParams({
    scope: "past",
    take: String(take),
    offset: String(offset),
  });
  if (order !== "date-desc") {
    params.set("order", order);
  }
  return `/bookings/me?${params.toString()}`;
}

export function buildUserBookingsUpcomingEndpoint(order: SessionSortOrder = "upcoming"): string {
  const params = new URLSearchParams({ scope: "upcoming" });
  if (order !== "upcoming") {
    params.set("order", order);
  }
  return `/bookings/me?${params.toString()}`;
}
