"use client";

import { useTranslations } from "next-intl";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { formatSessionRange } from "@/lib/format-session-time";
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
  const timeLabel = formatSessionRange(locale, session.startsAt, session.endsAt);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
          {coachName}
        </p>
        <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
          {session.classType.name}
        </h3>
      </div>

      <div className="mt-5 space-y-2 rounded-2xl border border-white/70 bg-white/60 p-4">
        <p className="text-sm font-medium text-sage-900">{timeLabel}</p>
        <p className="text-xs text-sage-600">
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
