import type { BookingMineRow } from "../../../lib/api/memberClient";
import type { NextClassContent } from "../components/NextClassSection";
import {
  formatDurationMinutes,
  formatSessionStartLabel,
} from "../../../lib/member/formatSessionLabels";

const DEFAULT_LOCALE = "en-US";

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
  locale = DEFAULT_LOCALE,
): NextClassContent {
  const { session } = b;
  const coachName = session.coach.user.name?.trim() || "Your coach";
  const bookedApprox = "View schedule for availability";
  return {
    title: session.classType.name,
    badge: "COMING UP NEXT",
    timeLocation: formatSessionStartLabel(session.startsAt, locale),
    instructor: `with ${coachName}`,
    durationLabel: formatDurationMinutes(session.startsAt, session.endsAt),
    spotsLabel: `${bookedApprox} · max ${session.capacity}`,
    statusLabel: "Confirmed",
  };
}
