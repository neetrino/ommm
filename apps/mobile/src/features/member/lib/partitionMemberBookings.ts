import type { BookingMineRow } from "../../../lib/api/memberClient";

export type MemberBookingsTab = "upcoming" | "past";

function sessionStartMs(iso: string): number {
  return new Date(iso).getTime();
}

export function isUpcomingMemberBooking(
  booking: BookingMineRow,
  nowMs: number = Date.now(),
): boolean {
  return (
    booking.status === "BOOKED" && sessionStartMs(booking.session.startsAt) > nowMs
  );
}

export function partitionMemberBookings(
  rows: readonly BookingMineRow[],
  nowMs: number = Date.now(),
): { upcoming: BookingMineRow[]; past: BookingMineRow[] } {
  const upcoming: BookingMineRow[] = [];
  const past: BookingMineRow[] = [];

  for (const row of rows) {
    if (isUpcomingMemberBooking(row, nowMs)) {
      upcoming.push(row);
    } else {
      past.push(row);
    }
  }

  upcoming.sort(
    (a, b) =>
      sessionStartMs(a.session.startsAt) - sessionStartMs(b.session.startsAt),
  );
  past.sort(
    (a, b) =>
      sessionStartMs(b.session.startsAt) - sessionStartMs(a.session.startsAt),
  );

  return { upcoming, past };
}

export function bookingsForTab(
  rows: readonly BookingMineRow[],
  tab: MemberBookingsTab,
): BookingMineRow[] {
  const { upcoming, past } = partitionMemberBookings(rows);
  return tab === "upcoming" ? upcoming : past;
}
