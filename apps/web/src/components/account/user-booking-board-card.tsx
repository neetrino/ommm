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
import type { UserBookingRow } from "@/lib/user-booking-types";

type UserBookingBoardCardProps = {
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

export function UserBookingBoardCard({
  locale,
  booking,
  showCancel,
  showRebook,
}: UserBookingBoardCardProps) {
  const coachName = resolveSessionCoachName(booking.session.coach);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <SessionClassTitle
        variant="board"
        name={booking.session.classType.name}
        trailing={
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${bookingStatusClassName(booking.status)}`}
          >
            {booking.status}
          </span>
        }
      />

      <SessionDateTimeHighlight
        locale={locale}
        startsAt={booking.session.startsAt}
        endsAt={booking.session.endsAt}
        variant="board"
        className="mt-5"
      />
      <SessionCoachLine coachName={coachName} variant="board" className="mt-3" />

      <div className="mt-auto flex justify-end border-t border-white/70 pt-4">
        {showCancel && booking.status === "BOOKED" ? (
          <CancelBookingButton
            bookingId={booking.id}
            sessionDate={booking.session.startsAt}
            sessionStartTime={scheduleStartTimeFromIso(booking.session.startsAt)}
            bookedAt={booking.createdAt}
            appearance="button"
            size="sm"
            wrapperClassName="flex flex-col items-end gap-1"
          />
        ) : null}
        {showRebook ? <RebookButton sessionId={booking.session.id} /> : null}
      </div>
    </article>
  );
}
