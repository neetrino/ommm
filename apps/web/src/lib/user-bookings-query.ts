import type { UserBookingRow } from "@/lib/user-booking-types";

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
): string {
  const params = new URLSearchParams({
    scope: "past",
    take: String(take),
    offset: String(offset),
  });
  return `/bookings/me?${params.toString()}`;
}
