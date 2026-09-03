"use client";

import { useTranslations } from "next-intl";
import { LeaveWaitlistButton } from "@/components/account/leave-waitlist-button";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

type UserWaitlistBoardCardProps = {
  locale: string;
  waitlist: UserWaitlistRow;
  onLeft?: () => void;
};

export function UserWaitlistBoardCard({
  locale,
  waitlist,
  onLeft,
}: UserWaitlistBoardCardProps) {
  const t = useTranslations("userPages.waitlists");
  const coachName = resolveSessionCoachName(waitlist.session.coach);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] sm:p-6">
      <SessionClassTitle
        variant="board"
        name={waitlist.session.classType.name}
        eyebrow={t("title")}
      />

      <SessionDateTimeHighlight
        locale={locale}
        startsAt={waitlist.session.startsAt}
        endsAt={waitlist.session.endsAt}
        variant="board"
        className="mt-5"
      />
      <SessionCoachLine coachName={coachName} variant="board" className="mt-3" />

      <p className="mt-4 text-xs uppercase tracking-wide text-sage-500">
        {t("waitlistBadge", { pos: waitlist.position, status: waitlist.status })}
      </p>

      <div className="mt-auto flex justify-end border-t border-white/70 pt-4">
        <LeaveWaitlistButton
          sessionId={waitlist.session.id}
          appearance="button"
          size="sm"
          wrapperClassName="flex flex-col items-end gap-1"
          onLeft={onLeft}
        />
      </div>
    </article>
  );
}
