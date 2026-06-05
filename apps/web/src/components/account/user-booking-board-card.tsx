"use client";

import { useTranslations } from "next-intl";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { RebookButton } from "@/components/account/rebook-button";
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
  const t = useTranslations("userPages.bookings");

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <SessionDateTimeHighlight
        locale={locale}
        startsAt={booking.session.startsAt}
        endsAt={booking.session.endsAt}
        variant="board"
      />

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {t("listHeaderClass")}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {booking.session.classType.name}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${bookingStatusClassName(booking.status)}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="mt-auto border-t border-white/70 pt-4">
        {showCancel && booking.status === "BOOKED" ? (
          <CancelBookingButton bookingId={booking.id} />
        ) : null}
        {showRebook ? <RebookButton sessionId={booking.session.id} /> : null}
      </div>
    </article>
  );
}
