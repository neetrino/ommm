"use client";

import { useTranslations } from "next-intl";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

type SessionDateTimeHighlightProps = {
  locale: string;
  startsAt: string;
  endsAt: string;
  variant: "board" | "list";
  className?: string;
};

const BOARD_SHELL =
  "rounded-2xl border border-sand-200/70 bg-gradient-to-br from-sand-50/95 via-white/90 to-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

const CALENDAR_CHIP_BOARD =
  "flex min-w-[4.25rem] flex-col items-center justify-center rounded-2xl border border-white/90 bg-white px-3 py-2.5 shadow-sm";

const CALENDAR_CHIP_LIST =
  "flex w-[3.75rem] shrink-0 flex-col items-center justify-center rounded-xl border border-white/80 bg-sand-50/90 px-2 py-2";

function relativeBadgeClass(relativeDay: "today" | "tomorrow"): string {
  return relativeDay === "today"
    ? "bg-mint-100 text-mint-900"
    : "bg-sand-100 text-sand-800";
}

export function SessionDateTimeHighlight({
  locale,
  startsAt,
  endsAt,
  variant,
  className = "",
}: SessionDateTimeHighlightProps) {
  const t = useTranslations("common");
  const display = buildSessionDateTimeDisplay(locale, startsAt, endsAt);

  if (display === null) {
    return null;
  }

  const relativeLabel =
    display.relativeDay === "today"
      ? t("sessionToday")
      : display.relativeDay === "tomorrow"
        ? t("sessionTomorrow")
        : null;

  if (variant === "board") {
    return (
      <div className={`${BOARD_SHELL} ${className}`.trim()}>
        <div className="flex items-center gap-4">
          <div className={CALENDAR_CHIP_BOARD} aria-hidden="true">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sand-600">
              {display.weekdayShort}
            </span>
            <span className="font-serif text-[2rem] leading-none text-sage-950">
              {display.dayNumber}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-sage-600">
              {display.monthShort}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            {relativeLabel !== null ? (
              <span
                className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${relativeBadgeClass(display.relativeDay as "today" | "tomorrow")}`}
              >
                {relativeLabel}
              </span>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sage-500">
                {display.dateLine}
              </p>
            )}
            <p className="mt-1 font-serif text-3xl leading-none tracking-tight text-sage-950 sm:text-[2rem]">
              {display.startTime}
            </p>
            <p className="mt-1.5 text-sm font-medium text-sage-600">
              {t("sessionUntil")} {display.endTime}
              {display.durationMinutes > 0
                ? ` · ${t("sessionDurationMinutes", { minutes: display.durationMinutes })}`
                : null}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <div className={CALENDAR_CHIP_LIST} aria-hidden="true">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-sand-600">
          {display.weekdayShort}
        </span>
        <span className="text-xl font-semibold leading-none text-sage-950">
          {display.dayNumber}
        </span>
        <span className="text-[10px] font-semibold uppercase text-sage-500">
          {display.monthShort}
        </span>
      </div>
      <div className="min-w-0">
        {relativeLabel !== null ? (
          <span
            className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${relativeBadgeClass(display.relativeDay as "today" | "tomorrow")}`}
          >
            {relativeLabel}
          </span>
        ) : null}
        <p className="font-semibold tabular-nums tracking-tight text-sage-900">
          {display.timeRange}
        </p>
        <p className="mt-0.5 text-xs text-sage-500">{display.dateLine}</p>
      </div>
    </div>
  );
}
