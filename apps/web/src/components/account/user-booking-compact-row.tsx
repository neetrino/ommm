"use client";

import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { RebookButton } from "@/components/account/rebook-button";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  USER_BOOKINGS_LIST_ACTIONS_CELL,
  USER_BOOKINGS_LIST_CLASS_CELL,
  USER_BOOKINGS_LIST_DATE_CELL,
  USER_BOOKINGS_LIST_ROW_CLASS,
  USER_BOOKINGS_LIST_STATUS_CELL,
  USER_BOOKINGS_LIST_TIME_CELL,
} from "@/components/account/user-bookings-list-layout";
import type { UserBookingRow } from "@/lib/user-booking-types";

type UserBookingCompactRowProps = {
  locale: string;
  booking: UserBookingRow;
  showCancel: boolean;
  showRebook: boolean;
};

function bookingStatusClassName(status: string): string {
  if (status === "BOOKED") return "bg-mint-100 text-mint-900";
  if (status === "CANCELLED") return "bg-sage-100 text-sage-700";
  if (status === "COMPLETED") return "bg-sky-100 text-sky-900";
  if (status === "NO_SHOW") return "bg-amber-100 text-amber-900";
  return "bg-sage-100 text-sage-700";
}

export function UserBookingCompactRow({
  locale,
  booking,
  showCancel,
  showRebook,
}: UserBookingCompactRowProps) {
  const coachName = resolveSessionCoachName(booking.session.coach);

  return (
    <div className={USER_BOOKINGS_LIST_ROW_CLASS}>
      <div className={USER_BOOKINGS_LIST_DATE_CELL}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={booking.session.startsAt}
          endsAt={booking.session.endsAt}
          variant="listDate"
        />
      </div>

      <div className={USER_BOOKINGS_LIST_CLASS_CELL}>
        <SessionClassTitle variant="list" name={booking.session.classType.name} />
        <SessionCoachLine coachName={coachName} variant="list" className="mt-1" />
      </div>

      <div className={USER_BOOKINGS_LIST_TIME_CELL}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={booking.session.startsAt}
          endsAt={booking.session.endsAt}
          variant="listTime"
        />
      </div>

      <div className={USER_BOOKINGS_LIST_STATUS_CELL}>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${bookingStatusClassName(booking.status)}`}
        >
          {booking.status}
        </span>
      </div>

      <div className={USER_BOOKINGS_LIST_ACTIONS_CELL}>
        {showCancel && booking.status === "BOOKED" ? (
          <CancelBookingButton bookingId={booking.id} />
        ) : null}
        {showRebook ? <RebookButton sessionId={booking.session.id} /> : null}
      </div>
    </div>
  );
}
