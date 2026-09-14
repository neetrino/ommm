"use client";

import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { scheduleStartTimeFromIso } from "@/lib/cancellation-policy";
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
import {
  USER_BOOKING_STATUS_BADGE_CLASS,
  userBookingStatusClassName,
} from "@/components/account/user-booking-status";
import type { UserBookingRow } from "@/lib/user-booking-types";

type UserBookingCompactRowProps = {
  locale: string;
  booking: UserBookingRow;
  showCancel: boolean;
  showRebook: boolean;
};

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
          className={`${USER_BOOKING_STATUS_BADGE_CLASS} ${userBookingStatusClassName(booking.status)}`}
        >
          {booking.status}
        </span>
      </div>

      <div className={USER_BOOKINGS_LIST_ACTIONS_CELL}>
        {showCancel && booking.status === "BOOKED" ? (
          <CancelBookingButton
            bookingId={booking.id}
            sessionDate={booking.session.startsAt}
            sessionStartTime={scheduleStartTimeFromIso(booking.session.startsAt)}
            bookedAt={booking.createdAt}
          />
        ) : null}
        {showRebook ? <RebookButton sessionId={booking.session.id} /> : null}
      </div>
    </div>
  );
}
