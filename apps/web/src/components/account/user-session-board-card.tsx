"use client";

import { useTranslations } from "next-intl";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserSessionRow } from "@/lib/user-booking-types";

type UserSessionBoardCardProps = {
  locale: string;
  session: UserSessionRow;
};

export function UserSessionBoardCard({ locale, session }: UserSessionBoardCardProps) {
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
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <SessionClassTitle
        variant="board"
        name={session.classType.name}
        eyebrow={coachName}
      />

      <SessionDateTimeHighlight
        locale={locale}
        startsAt={session.startsAt}
        endsAt={session.endsAt}
        variant="board"
        className="mt-5"
      />

      <div className="mt-4 rounded-2xl border border-white/70 bg-white/60 px-4 py-3">
        <p className="text-sm text-sage-700">
          {spots} · {pricing}
        </p>
      </div>

      <div className="mt-auto border-t border-white/70 pt-4">
        {full ? (
          <JoinWaitlistButton sessionId={session.id} />
        ) : (
          <BookSessionButton sessionId={session.id} priceCents={session.priceCents} />
        )}
      </div>
    </article>
  );
}
