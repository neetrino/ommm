import type { SessionDateTimeDisplay } from "@/lib/session-datetime-display";

export const SESSION_DATETIME_LIST_DATE_CHIP_CLASS =
  "flex w-[2.75rem] shrink-0 flex-col items-center justify-center text-center";

type SessionDateTimeListDateChipProps = {
  display: SessionDateTimeDisplay;
  className?: string;
};

export function SessionDateTimeListDateChip({
  display,
  className = "",
}: SessionDateTimeListDateChipProps) {
  return (
    <div
      className={`${SESSION_DATETIME_LIST_DATE_CHIP_CLASS} ${className}`.trim()}
      aria-hidden="true"
    >
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
  );
}

type SessionDateTimeListTimeBlockProps = {
  display: SessionDateTimeDisplay;
  untilLabel: string;
  durationMinutesLabel: string | null;
  className?: string;
};

export function SessionDateTimeListTimeBlock({
  display,
  untilLabel,
  durationMinutesLabel,
  className = "",
}: SessionDateTimeListTimeBlockProps) {
  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <p className="font-serif text-xl leading-none tracking-tight text-sage-950">
        {display.startTime}
      </p>
      <p className="mt-1 text-[11px] font-medium leading-snug text-sage-600">
        {untilLabel} {display.endTime}
        {durationMinutesLabel !== null ? ` · ${durationMinutesLabel}` : null}
      </p>
    </div>
  );
}

/** Bordered time card — member mobile class rows (start time + until · duration). */
export const SESSION_DATETIME_MOBILE_TIME_CARD_SHELL =
  "w-full rounded-[20px] border border-sage-900/20 bg-white px-3.5 py-3";

export const SESSION_DATETIME_MOBILE_TIME_CARD_SHELL_LIGHT =
  "w-full rounded-[20px] border border-sage-900/10 bg-white px-3.5 py-3";

function SessionDateTimeClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5l2.5 1.5" />
    </svg>
  );
}

type SessionDateTimeListTimeCardProps = {
  display: SessionDateTimeDisplay;
  untilLabel: string;
  durationMinutesLabel: string | null;
  className?: string;
  /** Clock icon + inline layout for member mobile class cards. */
  withClockIcon?: boolean;
  /** Lighter border stroke for member mobile class cards. */
  lightBorder?: boolean;
};

export function SessionDateTimeListTimeCard({
  display,
  untilLabel,
  durationMinutesLabel,
  className = "",
  withClockIcon = false,
  lightBorder = false,
}: SessionDateTimeListTimeCardProps) {
  const timeCardShell = lightBorder
    ? SESSION_DATETIME_MOBILE_TIME_CARD_SHELL_LIGHT
    : SESSION_DATETIME_MOBILE_TIME_CARD_SHELL;
  const startTimeLine = (
    <p className="font-serif text-2xl leading-none tracking-tight text-sage-950">
      {display.startTime}
    </p>
  );

  const untilLine = (
    <p className="text-xs font-medium leading-snug text-sage-800">
      {untilLabel} {display.endTime}
      {durationMinutesLabel !== null ? ` · ${durationMinutesLabel}` : null}
    </p>
  );

  const timeTexts = (
    <div className="min-w-0 space-y-1.5">
      {startTimeLine}
      {untilLine}
    </div>
  );

  if (!withClockIcon) {
    return (
      <div className={`${timeCardShell} max-w-xs space-y-1.5 ${className}`.trim()}>
        {startTimeLine}
        {untilLine}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${timeCardShell} ${className}`.trim()}>
      <SessionDateTimeClockIcon className="size-6 shrink-0 text-sage-700" />
      {timeTexts}
    </div>
  );
}

type SessionDateTimeListPairProps = {
  display: SessionDateTimeDisplay;
  untilLabel: string;
  durationMinutesLabel: string | null;
  className?: string;
};

/** listDate + listTime pair used in admin/coach/manager compact rows. */
export function SessionDateTimeListPair({
  display,
  untilLabel,
  durationMinutesLabel,
  className = "",
}: SessionDateTimeListPairProps) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <SessionDateTimeListDateChip display={display} />
      <SessionDateTimeListTimeBlock
        display={display}
        untilLabel={untilLabel}
        durationMinutesLabel={durationMinutesLabel}
      />
    </div>
  );
}
