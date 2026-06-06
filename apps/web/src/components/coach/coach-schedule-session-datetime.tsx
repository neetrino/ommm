import { getTranslations } from "next-intl/server";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

const CALENDAR_FLOAT_LIST =
  "flex w-[2.75rem] shrink-0 flex-col items-center justify-center text-center";

type CoachScheduleSessionDateTimeProps = {
  locale: string;
  startsAt: string;
  endsAt: string;
};

/** Server-side date/time column — matches admin `SessionDateTimeHighlight` list variants. */
export async function CoachScheduleSessionDateTime({
  locale,
  startsAt,
  endsAt,
}: CoachScheduleSessionDateTimeProps) {
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const display = buildSessionDateTimeDisplay(locale, startsAt, endsAt);

  if (display === null) {
    return null;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={CALENDAR_FLOAT_LIST} aria-hidden="true">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-sand-600">
          {display.weekdayShort}
        </span>
        <span className="font-serif text-2xl leading-none text-sage-950">
          {display.dayNumber}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-sage-600">
          {display.monthShort}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-serif text-xl leading-none tracking-tight text-sage-950">
          {display.startTime}
        </p>
        <p className="mt-1 text-[11px] font-medium leading-snug text-sage-600">
          {tCommon("sessionUntil")} {display.endTime}
          {display.durationMinutes > 0
            ? ` · ${tCommon("sessionDurationMinutes", { minutes: display.durationMinutes })}`
            : null}
        </p>
      </div>
    </div>
  );
}
