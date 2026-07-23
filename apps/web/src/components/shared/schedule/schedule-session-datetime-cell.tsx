import { getTranslations } from "next-intl/server";
import { SessionDateTimeListPair } from "@/components/shared/schedule/session-datetime-list-display";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

type ScheduleSessionDateTimeCellProps = {
  locale: string;
  startsAt: string;
  endsAt: string;
};

/** Server RSC date/time column for staff schedule lists. */
export async function ScheduleSessionDateTimeCell({
  locale,
  startsAt,
  endsAt,
}: ScheduleSessionDateTimeCellProps) {
  const tCommon = await getTranslations({ locale, namespace: "common" });
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
