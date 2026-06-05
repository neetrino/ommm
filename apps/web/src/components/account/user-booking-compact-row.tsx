"use client";

import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { RebookButton } from "@/components/account/rebook-button";
import { formatSessionRange } from "@/lib/format-session-time";
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
  const timeLabel = formatSessionRange(
    locale,
    booking.session.startsAt,
    booking.session.endsAt,
  );

  return (
    <div className="ommm-list-row flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] md:items-center md:gap-4">
      <div className="min-w-0">
        <p className="font-medium text-sage-800">{booking.session.classType.name}</p>
        <p className="mt-0.5 text-xs text-sage-500 md:hidden">{timeLabel}</p>
      </div>
      <p className="hidden text-sm text-sage-600 md:block">{timeLabel}</p>
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
