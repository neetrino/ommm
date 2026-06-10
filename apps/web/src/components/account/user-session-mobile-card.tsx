"use client";

import { useTranslations } from "next-intl";
import { SessionBookingActions } from "@/components/account/session-booking-actions";
import { SESSION_BOOKED_CARD_CLASS } from "@/components/account/session-booked-badge";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionCoachLine } from "@/components/account/session-coach-line";
import { SessionSpotsLine } from "@/components/account/session-spots-line";
import {
  USER_SESSION_MOBILE_CARD_BODY_CLASS,
  USER_SESSION_MOBILE_CARD_CLASS,
  USER_SESSION_MOBILE_CARD_DIVIDER_CLASS,
  USER_SESSION_MOBILE_CARD_HEADER_CLASS,
  USER_SESSION_MOBILE_CARD_RELATIVE_LABEL_CLASS,
} from "@/components/account/user-session-mobile-card-layout";
import { SessionDateTimeListTimeCard } from "@/components/shared/schedule/session-datetime-list-display";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";
import type { UserSessionRow } from "@/lib/user-booking-types";

type UserSessionMobileCardProps = {
  locale: string;
  session: UserSessionRow;
  coachName: string | null;
  spotsLabel: string;
  pricingLabel: string;
  full: boolean;
  isUserBooked: boolean;
  activeBookingId?: string;
  onBookingChange: (bookingId: string | undefined) => void;
  className?: string;
};

function MobileCardDateHeader({
  weekdayShort,
  dayNumber,
  relativeLabel,
}: {
  weekdayShort: string;
  dayNumber: number;
  relativeLabel: string | null;
}) {
  return (
    <header className={USER_SESSION_MOBILE_CARD_HEADER_CLASS}>
      <div className="flex flex-col items-center gap-px text-center" aria-hidden="true">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage-600">
          {weekdayShort}
        </span>
        <span className="font-serif text-[2rem] leading-none text-sage-950 tabular-nums">{dayNumber}</span>
      </div>
      {relativeLabel ? (
        <span className={`${USER_SESSION_MOBILE_CARD_RELATIVE_LABEL_CLASS} pointer-events-none`}>
          {relativeLabel}
        </span>
      ) : null}
    </header>
  );
}

export function UserSessionMobileCard({
  locale,
  session,
  coachName,
  spotsLabel,
  pricingLabel,
  full,
  isUserBooked,
  activeBookingId,
  onBookingChange,
  className = "",
}: UserSessionMobileCardProps) {
  const tCommon = useTranslations("common");
  const display = buildSessionDateTimeDisplay(locale, session.startsAt, session.endsAt);
  const durationMinutesLabel =
    display !== null && display.durationMinutes > 0
      ? tCommon("sessionDurationMinutes", { minutes: display.durationMinutes })
      : null;
  const relativeLabel =
    display?.relativeDay === "today"
      ? tCommon("sessionToday")
      : display?.relativeDay === "tomorrow"
        ? tCommon("sessionTomorrow")
        : null;

  const cardClass = [USER_SESSION_MOBILE_CARD_CLASS, isUserBooked ? SESSION_BOOKED_CARD_CLASS : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      {display ? (
        <MobileCardDateHeader
          weekdayShort={display.weekdayShort}
          dayNumber={display.dayNumber}
          relativeLabel={relativeLabel}
        />
      ) : null}

      <div className={USER_SESSION_MOBILE_CARD_BODY_CLASS}>
        <SessionClassTitle variant="list" name={session.classType.name} />

        {display ? (
          <SessionDateTimeListTimeCard
            display={display}
            untilLabel={tCommon("sessionUntil")}
            durationMinutesLabel={durationMinutesLabel}
            withClockIcon
            lightBorder
          />
        ) : null}

        <SessionCoachLine coachName={coachName} variant="board" className="-ml-[2px]" />

        <div className={USER_SESSION_MOBILE_CARD_DIVIDER_CLASS} />

        <SessionSpotsLine spotsLabel={spotsLabel} pricingLabel={pricingLabel} />

        <SessionBookingActions
          sessionId={session.id}
          sessionStartsAt={session.startsAt}
          priceCents={session.priceCents}
          full={full}
          userBookingId={activeBookingId}
          onBookingChange={onBookingChange}
          layout="list"
          size="md"
        />
      </div>
    </article>
  );
}
