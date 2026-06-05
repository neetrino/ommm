"use client";

import { useTranslations } from "next-intl";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { resolveSessionCoachName } from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  USER_SCHEDULE_LIST_ACTIONS_CLASS,
  USER_SCHEDULE_LIST_CELL_CLASS,
  USER_SCHEDULE_LIST_ROW_CLASS,
} from "@/components/account/user-schedule-list-layout";
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
  const coachName = resolveSessionCoachName(session.coach) ?? t("coachFallback");
  const spots = t("spotsBooked", { booked, capacity: session.capacity });
  const pricing =
    session.priceCents > 0
      ? t("paidShort", { amount: formatAmdFromCents(session.priceCents, locale) })
      : t("includedShort");

  return (
    <div className={USER_SCHEDULE_LIST_ROW_CLASS}>
      <div className={USER_SCHEDULE_LIST_CELL_CLASS}>
        <SessionClassTitle variant="list" name={session.classType.name} />
      </div>
      <div className={`${USER_SCHEDULE_LIST_CELL_CLASS} pt-0.5`}>
        <p className="text-sm font-medium leading-snug text-sage-800">{coachName}</p>
      </div>
      <div className={USER_SCHEDULE_LIST_CELL_CLASS}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={session.startsAt}
          endsAt={session.endsAt}
          variant="list"
        />
      </div>
      <div className={`${USER_SCHEDULE_LIST_CELL_CLASS} pt-0.5`}>
        <p className="text-xs leading-relaxed text-sage-600">
          {spots} · {pricing}
        </p>
      </div>
      <div className={USER_SCHEDULE_LIST_ACTIONS_CLASS}>
        {full ? (
          <JoinWaitlistButton sessionId={session.id} />
        ) : (
          <BookSessionButton sessionId={session.id} priceCents={session.priceCents} />
        )}
      </div>
    </div>
  );
}
