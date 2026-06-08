import type { UserBookingRow } from "@/lib/user-booking-types";

export type UserSessionBookingMap = Readonly<Record<string, string>>;

/** Maps upcoming BOOKED session ids to booking ids for the signed-in member. */
export function buildUserSessionBookingMap(
  bookings: readonly UserBookingRow[],
): UserSessionBookingMap {
  const map: Record<string, string> = {};
  const now = Date.now();

  for (const booking of bookings) {
    if (booking.status !== "BOOKED") {
      continue;
    }
    const startsAt = new Date(booking.session.startsAt).getTime();
    if (startsAt <= now) {
      continue;
    }
    map[booking.session.id] = booking.id;
  }

  return map;
}
