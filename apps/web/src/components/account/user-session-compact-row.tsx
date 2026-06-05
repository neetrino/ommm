"use client";

import { useTranslations } from "next-intl";
import { BookSessionButton } from "@/components/account/book-session-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { SessionSpotsIndicator } from "@/components/account/session-spots-indicator";
import {
  USER_SCHEDULE_LIST_ACTIONS_CLASS,
  USER_SCHEDULE_LIST_CLASS_CELL,
  USER_SCHEDULE_LIST_DATE_CELL,
  USER_SCHEDULE_LIST_ROW_CLASS,
  USER_SCHEDULE_LIST_SPACER_CELL,
  USER_SCHEDULE_LIST_SPOTS_CELL,
  USER_SCHEDULE_LIST_TIME_CELL,
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
  const coachName = resolveSessionCoachName(session.coach);
  const spotsLabel = t("spotsBooked", { booked, capacity: session.capacity });
  const pricing =
    session.priceCents > 0
      ? t("paidShort", { amount: formatAmdFromCents(session.priceCents, locale) })
      : t("includedShort");

  return (
    <div className={USER_SCHEDULE_LIST_ROW_CLASS}>
      <div className={USER_SCHEDULE_LIST_DATE_CELL}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={session.startsAt}
          endsAt={session.endsAt}
          variant="listDate"
        />
      </div>

      <div className={USER_SCHEDULE_LIST_CLASS_CELL}>
        <SessionClassTitle variant="list" name={session.classType.name} />
        <SessionCoachLine coachName={coachName} variant="list" className="mt-1" />
      </div>

      <div className={USER_SCHEDULE_LIST_TIME_CELL}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={session.startsAt}
          endsAt={session.endsAt}
          variant="listTime"
        />
      </div>

      <div className={USER_SCHEDULE_LIST_SPOTS_CELL}>
        <SessionSpotsIndicator
          booked={booked}
          capacity={session.capacity}
          pricingLabel={pricing}
          spotsLabel={spotsLabel}
        />
      </div>

      <div className={USER_SCHEDULE_LIST_SPACER_CELL} aria-hidden="true" />

      <div className={USER_SCHEDULE_LIST_ACTIONS_CLASS}>
        {full ? (
          <JoinWaitlistButton sessionId={session.id} size="md" />
        ) : (
          <BookSessionButton sessionId={session.id} priceCents={session.priceCents} size="md" />
        )}
      </div>
    </div>
  );
}
