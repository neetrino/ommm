"use client";

import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { USER_LIST_ROW_CARD } from "@/components/account/user-list-table-layout";
import { coachName } from "@/components/admin/admin-schedule-session-display";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";

export type ScheduleWeekMiniCardSession = Pick<
  ScheduleSessionListRow,
  "id" | "title" | "startsAt" | "endsAt" | "capacity" | "classType"
> & {
  coach?: ScheduleSessionListRow["coach"];
  _count?: ScheduleSessionListRow["_count"];
};

export type ScheduleWeekCardVariant = "member" | "staff";

type ScheduleWeekSessionMiniCardProps = {
  locale: string;
  session: ScheduleWeekMiniCardSession;
  showCoach?: boolean;
  variant?: ScheduleWeekCardVariant;
  onClick?: () => void;
  ariaLabel?: string;
};

const WEEK_CARD_SHELL = [
  "flex w-full shrink-0 flex-col gap-2 overflow-hidden text-left",
  USER_LIST_ROW_CARD,
  "rounded-[22px] px-3.5 py-3",
].join(" ");

const WEEK_CARD_INTERACTIVE = [
  WEEK_CARD_SHELL,
  "cursor-pointer active:scale-[0.99]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

function resolveCoachLabel(
  session: ScheduleWeekMiniCardSession,
  showCoach: boolean,
): string | null {
  if (!showCoach || !session.coach) {
    return null;
  }
  const label = coachName(session.coach) || resolveSessionCoachName(session.coach);
  if (!label || label === "—") {
    return null;
  }
  return label;
}

function ScheduleWeekCardSpots({
  locale,
  session,
  variant,
  booked,
  capacity,
  spotsLabel,
}: {
  locale: string;
  session: ScheduleWeekMiniCardSession;
  variant: ScheduleWeekCardVariant;
  booked: number;
  capacity: number;
  spotsLabel: string;
}) {
  const tStaff = useTranslations("adminPages.classes");

  if (variant !== "staff") {
    return <p className="truncate text-left text-xs font-medium text-sage-700">{spotsLabel}</p>;
  }

  return (
    <div
      className="min-w-0 max-w-full"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <ScheduleSessionRegistrationsCapacity
        sessionId={session.id}
        sessionTitle={session.title}
        startsAt={session.startsAt}
        locale={locale}
        booked={booked}
        capacity={capacity}
        spotsLabel={spotsLabel}
        secondaryLabel=""
        bookedCountAriaLabel={tStaff("registrationsModal.viewBookedAria", {
          count: booked,
        })}
        layout="compactText"
      />
    </div>
  );
}

function ScheduleWeekSessionMiniCardContent({
  locale,
  session,
  showCoach,
  variant,
}: {
  locale: string;
  session: ScheduleWeekMiniCardSession;
  showCoach: boolean;
  variant: ScheduleWeekCardVariant;
}) {
  const tCommon = useTranslations("common");
  const classTypeName = session.classType?.name?.trim();
  const eyebrow =
    classTypeName && classTypeName !== session.title ? classTypeName : undefined;
  const coachLabel = resolveCoachLabel(session, showCoach);
  const booked = session._count?.bookings;
  const capacity = session.capacity;
  const hasCapacity = booked !== undefined && capacity !== undefined;
  const spotsLabel = hasCapacity
    ? tCommon("registeredCount", { booked, capacity })
    : null;

  return (
    <>
      <SessionClassTitle variant="week" name={session.title} eyebrow={eyebrow} />
      <SessionDateTimeHighlight
        locale={locale}
        startsAt={session.startsAt}
        endsAt={session.endsAt}
        variant="weekTime"
      />
      {coachLabel ? (
        <SessionCoachLine coachName={coachLabel} variant="list" hideRoleLabel />
      ) : null}
      {spotsLabel && hasCapacity ? (
        <ScheduleWeekCardSpots
          locale={locale}
          session={session}
          variant={variant}
          booked={booked}
          capacity={capacity}
          spotsLabel={spotsLabel}
        />
      ) : null}
    </>
  );
}

export function ScheduleWeekSessionMiniCard({
  locale,
  session,
  showCoach = false,
  variant = "staff",
  onClick,
  ariaLabel,
}: ScheduleWeekSessionMiniCardProps) {
  const content = (
    <ScheduleWeekSessionMiniCardContent
      locale={locale}
      session={session}
      showCoach={showCoach}
      variant={variant}
    />
  );

  if (!onClick) {
    return <article className={WEEK_CARD_SHELL}>{content}</article>;
  }

  return (
    <article
      role="button"
      tabIndex={0}
      className={WEEK_CARD_INTERACTIVE}
      aria-label={ariaLabel ?? session.title}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {content}
    </article>
  );
}
