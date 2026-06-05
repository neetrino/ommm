"use client";

import { useTranslations } from "next-intl";
import { formatSessionRange } from "@/lib/format-session-time";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

type UserWaitlistBoardCardProps = {
  locale: string;
  waitlist: UserWaitlistRow;
};

export function UserWaitlistBoardCard({ locale, waitlist }: UserWaitlistBoardCardProps) {
  const t = useTranslations("userPages.bookings");
  const timeLabel = formatSessionRange(
    locale,
    waitlist.session.startsAt,
    waitlist.session.endsAt,
  );

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] sm:p-6">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
          {t("waitlists")}
        </p>
        <h3 className="font-serif text-xl font-normal text-sage-900">
          {waitlist.session.classType.name}
        </h3>
      </div>
      <div className="mt-5 space-y-2 rounded-2xl border border-white/70 bg-white/60 p-4">
        <p className="text-sm font-medium text-sage-900">{timeLabel}</p>
        <p className="text-xs uppercase tracking-wide text-sage-500">
          {t("waitlistBadge", { pos: waitlist.position, status: waitlist.status })}
        </p>
      </div>
    </article>
  );
}
