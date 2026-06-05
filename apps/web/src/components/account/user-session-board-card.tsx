"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import {
  SESSION_BOOKED_CARD_CLASS,
  SessionBookedBadge,
} from "@/components/account/session-booked-badge";
import { SessionBookingActions } from "@/components/account/session-booking-actions";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserSessionRow } from "@/lib/user-booking-types";

type UserSessionBoardCardProps = {
  locale: string;
  session: UserSessionRow;
  userBookingId?: string;
};

export function UserSessionBoardCard({
  locale,
  session,
  userBookingId,
}: UserSessionBoardCardProps) {
  const t = useTranslations("userPages.classes");
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(userBookingId);
  const booked = session._count.bookings;
  const full = booked >= session.capacity;
  const isUserBooked = Boolean(activeBookingId);

  useEffect(() => {
    setActiveBookingId(userBookingId);
  }, [userBookingId]);
  const coachName = resolveSessionCoachName(session.coach);
  const spots = t("spotsBooked", { booked, capacity: session.capacity });
  const pricing =
    session.priceCents > 0
      ? t("paidShort", { amount: formatAmdFromCents(session.priceCents, locale) })
      : t("includedShort");

  const cardClass = [
    "relative flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6",
    isUserBooked ? SESSION_BOOKED_CARD_CLASS : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      {isUserBooked ? (
        <div className="absolute right-5 top-5 sm:right-6 sm:top-6">
          <SessionBookedBadge />
        </div>
      ) : null}

      <SessionClassTitle variant="board" name={session.classType.name} />

      <SessionDateTimeHighlight
        locale={locale}
        startsAt={session.startsAt}
        endsAt={session.endsAt}
        variant="board"
        className="mt-5"
      />
      <SessionCoachLine coachName={coachName} variant="board" className="mt-3" />

      <p className="mt-4 text-left text-sm text-sage-700">
        {spots} · {pricing}
      </p>

      <div className="mt-auto border-t border-white/70 pt-4">
        <SessionBookingActions
          sessionId={session.id}
          priceCents={session.priceCents}
          full={full}
          userBookingId={activeBookingId}
          onBookingChange={setActiveBookingId}
          size="md"
        />
      </div>
    </article>
  );
}
