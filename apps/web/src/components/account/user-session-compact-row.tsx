"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  resolveSessionCoachName,
} from "@/components/account/session-coach-line";
import {
  SESSION_BOOKED_ROW_CLASS,
} from "@/components/account/session-booked-badge";
import { SessionBookingActions } from "@/components/account/session-booking-actions";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { SessionSpotsIndicator } from "@/components/account/session-spots-indicator";
import {
  USER_SCHEDULE_LIST_ACTIONS_CLASS,
  USER_SCHEDULE_LIST_CLASS_CELL,
  USER_SCHEDULE_LIST_COACH_CELL,
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
  userBookingId?: string;
};

export function UserSessionCompactRow({
  locale,
  session,
  userBookingId,
}: UserSessionCompactRowProps) {
  const t = useTranslations("userPages.classes");
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(userBookingId);
  const booked = session._count.bookings;
  const full = booked >= session.capacity;
  const isUserBooked = Boolean(activeBookingId);

  useEffect(() => {
    setActiveBookingId(userBookingId);
  }, [userBookingId]);
  const coachName = resolveSessionCoachName(session.coach);
  const spotsLabel = t("spotsBooked", { booked, capacity: session.capacity });
  const pricing =
    session.priceCents > 0
      ? t("paidShort", { amount: formatAmdFromCents(session.priceCents, locale) })
      : t("includedShort");

  const rowClass = [USER_SCHEDULE_LIST_ROW_CLASS, isUserBooked ? SESSION_BOOKED_ROW_CLASS : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClass}>
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
      </div>

      <div className={USER_SCHEDULE_LIST_TIME_CELL}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={session.startsAt}
          endsAt={session.endsAt}
          variant="listTime"
        />
      </div>

      <div className={USER_SCHEDULE_LIST_COACH_CELL}>
        <MobileLabel label={t("listHeaderCoach")} />
        <p className={`truncate text-xs font-semibold ${coachName ? "text-sage-800" : "text-sage-400"}`}>
          {coachName ?? "—"}
        </p>
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
        <SessionBookingActions
          sessionId={session.id}
          priceCents={session.priceCents}
          full={full}
          userBookingId={activeBookingId}
          onBookingChange={setActiveBookingId}
          layout="list"
          size="md"
        />
      </div>
    </div>
  );
}

function MobileLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500 md:hidden">
      {label}
    </p>
  );
}
