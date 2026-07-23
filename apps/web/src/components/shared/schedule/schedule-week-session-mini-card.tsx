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
  "flex w-full flex-col text-left",
  USER_LIST_ROW_CARD,
  "rounded-[28px] p-4 sm:p-5",
].join(" ");

const WEEK_CARD_INTERACTIVE = [
  WEEK_CARD_SHELL,
  "cursor-pointer active:scale-[0.99]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

const WEEK_TIME_SHELL =
  "mt-3 rounded-2xl border border-sand-200/70 bg-gradient-to-br from-sand-50/95 via-white/90 to-white/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

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
  const tStaff = useTranslations("adminPages.classes");
  const tUser = useTranslations("userPages.classes");
  const classTypeName = session.classType?.name?.trim();
  const eyebrow =
    classTypeName && classTypeName !== session.title ? classTypeName : undefined;
  const coachLabel = resolveCoachLabel(session, showCoach);
  const booked = session._count?.bookings;
  const capacity = session.capacity;
  const spotsLine =
    booked !== undefined && capacity !== undefined
      ? variant === "member"
        ? tUser("spotsBooked", { booked, capacity })
        : tStaff("fields.spotsBooked", { booked, capacity })
      : null;

  return (
    <>
      <SessionClassTitle variant="week" name={session.title} eyebrow={eyebrow} />

      <div className={WEEK_TIME_SHELL}>
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={session.startsAt}
          endsAt={session.endsAt}
          variant="listTime"
        />
      </div>

      {coachLabel ? (
        <SessionCoachLine coachName={coachLabel} variant="board" className="mt-3" />
      ) : null}

      {spotsLine ? (
        <p className="mt-3 text-left text-xs font-medium text-sage-700">{spotsLine}</p>
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
    <button
      type="button"
      className={WEEK_CARD_INTERACTIVE}
      onClick={onClick}
      aria-label={ariaLabel ?? session.title}
    >
      {content}
    </button>
  );
}
