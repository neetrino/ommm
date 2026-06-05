"use client";

import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { RebookButton } from "@/components/account/rebook-button";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
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
  return (
    <div className="ommm-list-row flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_auto] md:items-center md:gap-4">
      <SessionDateTimeHighlight
        locale={locale}
        startsAt={booking.session.startsAt}
        endsAt={booking.session.endsAt}
        variant="list"
      />
      <div className="min-w-0">
        <p className="font-medium text-sage-800">{booking.session.classType.name}</p>
      </div>
      <span
        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${bookingStatusClassName(booking.status)}`}
      >
        {booking.status}
      </span>
      <div className="flex shrink-0 flex-wrap gap-2">
        {showCancel && booking.status === "BOOKED" ? (
          <CancelBookingButton bookingId={booking.id} />
        ) : null}
        {showRebook ? <RebookButton sessionId={booking.session.id} /> : null}
      </div>
    </div>
  );
}
