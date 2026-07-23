import type { BookingMineRow } from "../../../lib/api/memberClient";
import type { NextClassContent } from "../components/NextClassSection";
import {
  formatDurationMinutes,
  formatSessionStartLabel,
} from "../../../lib/member/formatSessionLabels";
import type { MemberBookingCopy } from "../../member/hooks/useMemberBookingCopy";

export function pickNextUpcomingBooking(
  rows: BookingMineRow[],
): BookingMineRow | null {
  const now = Date.now();
  const upcoming = rows.filter(
    (b) =>
      b.status === "BOOKED" && new Date(b.session.startsAt).getTime() > now,
  );
  upcoming.sort(
    (a, b) =>
      new Date(a.session.startsAt).getTime() -
      new Date(b.session.startsAt).getTime(),
  );
  return upcoming[0] ?? null;
}

export function bookingToNextClassContent(
  b: BookingMineRow,
  labels: Pick<
    MemberBookingCopy,
    | "intlLocale"
    | "nextClassBadge"
    | "nextClassStatusBooked"
    | "coachFallback"
    | "withCoach"
    | "durationMinutes"
  > & {
    spotsLabel: (capacity: number) => string;
  },
): NextClassContent {
  const { session } = b;
  const coachName = session.coach.user.name?.trim() || labels.coachFallback;
  return {
    title: session.classType.name,
    badge: labels.nextClassBadge,
    timeLocation: formatSessionStartLabel(session.startsAt, labels.intlLocale),
    instructor: labels.withCoach(coachName),
    durationLabel: formatDurationMinutes(
      session.startsAt,
      session.endsAt,
      labels.durationMinutes,
    ),
    spotsLabel: labels.spotsLabel(session.capacity),
    statusLabel: labels.nextClassStatusBooked,
  };
}
