"use client";

import {
  coachName,
  formatSessionTimes,
} from "@/components/admin/admin-schedule-session-display";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

export type ScheduleWeekMiniCardSession = Pick<
  ScheduleSessionListRow,
  "id" | "title" | "startsAt" | "endsAt" | "coach"
>;

type ScheduleWeekSessionMiniCardProps = {
  locale: string;
  session: ScheduleWeekMiniCardSession;
  showCoach?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

const MINI_CARD_CLASS =
  "w-full rounded-[20px] border border-white/80 bg-white/95 p-3 text-left shadow-[0_14px_34px_-26px_rgba(45,40,35,0.35)] transition-all hover:border-white hover:shadow-[0_18px_40px_-26px_rgba(45,40,35,0.4)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export function ScheduleWeekSessionMiniCard({
  locale,
  session,
  showCoach = false,
  onClick,
  ariaLabel,
}: ScheduleWeekSessionMiniCardProps) {
  const { start, end } = formatSessionTimes(locale, session.startsAt, session.endsAt);
  const coachLabel = session.coach ? coachName(session.coach) : null;

  const content = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sand-600">
        {start} – {end}
      </p>
      <p className="mt-1 truncate font-serif text-base leading-snug tracking-tight text-sage-950">
        {session.title}
      </p>
      {showCoach && coachLabel ? (
        <p className="mt-1 truncate text-xs text-sage-500">{coachLabel}</p>
      ) : null}
    </>
  );

  if (!onClick) {
    return <article className={MINI_CARD_CLASS}>{content}</article>;
  }

  return (
    <button
      type="button"
      className={MINI_CARD_CLASS}
      onClick={onClick}
      aria-label={ariaLabel ?? session.title}
    >
      {content}
    </button>
  );
}
