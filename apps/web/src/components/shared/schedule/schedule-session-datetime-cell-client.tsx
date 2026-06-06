"use client";

import { useTranslations } from "next-intl";
import { SessionDateTimeListPair } from "@/components/shared/schedule/session-datetime-list-display";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

type ScheduleSessionDateTimeCellClientProps = {
  locale: string;
  startsAt: string;
  endsAt: string;
};

/** Client date/time column — same markup as {@link ScheduleSessionDateTimeCell}. */
export function ScheduleSessionDateTimeCellClient({
  locale,
  startsAt,
  endsAt,
}: ScheduleSessionDateTimeCellClientProps) {
  const tCommon = useTranslations("common");
  const display = buildSessionDateTimeDisplay(locale, startsAt, endsAt);

  if (display === null) {
    return null;
  }

  const durationMinutesLabel =
    display.durationMinutes > 0
      ? tCommon("sessionDurationMinutes", { minutes: display.durationMinutes })
      : null;

  return (
    <SessionDateTimeListPair
      display={display}
      untilLabel={tCommon("sessionUntil")}
      durationMinutesLabel={durationMinutesLabel}
    />
  );
}
