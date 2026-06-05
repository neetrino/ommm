"use client";

import { useTranslations } from "next-intl";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserSessionRow } from "@/lib/user-booking-types";

type UserSessionCompactRowProps = {
  locale: string;
  session: UserSessionRow;
};

export function UserSessionCompactRow({ locale, session }: UserSessionCompactRowProps) {
  const t = useTranslations("userPages.classes");
  const booked = session._count.bookings;
  const full = booked >= session.capacity;
  const coachName = session.coach.user.name ?? t("coachFallback");
  const spots = t("spotsBooked", { booked, capacity: session.capacity });
  const pricing =
    session.priceCents > 0
      ? t("paidShort", { amount: formatAmdFromCents(session.priceCents, locale) })
      : t("includedShort");

  return (
    <div className="ommm-list-row flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] md:items-center md:gap-4">
      <SessionClassTitle variant="list" name={session.classType.name} eyebrow={coachName} />
      <SessionDateTimeHighlight
        locale={locale}
        startsAt={session.startsAt}
        endsAt={session.endsAt}
        variant="list"
      />
      <p className="text-xs text-sage-500">
        {spots} · {pricing}
      </p>
      <div className="shrink-0">
        {full ? (
          <JoinWaitlistButton sessionId={session.id} />
        ) : (
          <BookSessionButton sessionId={session.id} priceCents={session.priceCents} />
        )}
      </div>
    </div>
  );
}
