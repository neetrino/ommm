import type { UserBookingRow } from "@/lib/user-booking-types";

export type UserSessionBookingRef = {
  bookingId: string;
  createdAt: string | null;
};

export type UserSessionBookingMap = Readonly<Record<string, UserSessionBookingRef>>;

export function sessionBookingId(
  map: UserSessionBookingMap,
  sessionId: string,
): string | undefined {
  return map[sessionId]?.bookingId;
}

export function sessionBookingCreatedAt(
  map: UserSessionBookingMap,
  sessionId: string,
): string | undefined {
  const createdAt = map[sessionId]?.createdAt;
  if (createdAt === null || createdAt === undefined || createdAt === "") {
    return undefined;
  }
  return createdAt;
}

/** Maps upcoming BOOKED session ids to booking ids for the signed-in member. */
export function buildUserSessionBookingMap(
  bookings: readonly UserBookingRow[],
): UserSessionBookingMap {
  const map: Record<string, UserSessionBookingRef> = {};
  const now = Date.now();

  for (const booking of bookings) {
    if (booking.status !== "BOOKED") {
      continue;
    }
    const startsAt = new Date(booking.session.startsAt).getTime();
    if (startsAt <= now) {
      continue;
    }
    map[booking.session.id] = {
      bookingId: booking.id,
      createdAt: booking.createdAt ?? null,
    };
  }

  return map;
}
