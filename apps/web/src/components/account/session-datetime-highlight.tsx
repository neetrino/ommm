"use client";

import { useTranslations } from "next-intl";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";
import {
  SessionDateTimeListDateChip,
  SessionDateTimeListTimeBlock,
  SessionDateTimeListTimeCard,
} from "@/components/shared/schedule/session-datetime-list-display";

type SessionDateTimeHighlightProps = {
  locale: string;
  startsAt: string;
  endsAt: string;
  variant:
    | "board"
    | "boardDateYear"
    | "listDate"
    | "listDateYear"
    | "listTime"
    | "listTimeCard"
    | "weekTime";
  className?: string;
};

const BOARD_SHELL =
  "rounded-2xl border border-sand-200/70 bg-gradient-to-br from-sand-50/95 via-white/90 to-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

const CALENDAR_CHIP_BOARD =
  "flex min-w-[4.25rem] flex-col items-center justify-center rounded-2xl border border-white/90 bg-white px-3 py-2.5 shadow-sm";

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
            ) : null}
            <p className="font-serif text-3xl leading-none tracking-tight text-sage-950 sm:text-[2rem]">
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

  if (variant === "boardDateYear") {
    return (
      <div className={`${BOARD_SHELL} ${className}`.trim()}>
        <div className="flex items-center gap-4">
          <div className={CALENDAR_CHIP_BOARD} aria-hidden="true">
            <span className="text-[10px] font-bold tabular-nums tracking-[0.08em] text-sand-600">
              {display.year}
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
            ) : null}
            <p className="font-serif text-3xl leading-none tracking-tight text-sage-950 sm:text-[2rem]">
              {display.startTime}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "listDate") {
    return <SessionDateTimeListDateChip display={display} className={className} />;
  }

  if (variant === "listDateYear") {
    return (
      <div className={`flex w-[2.75rem] shrink-0 flex-col items-center justify-center text-center ${className}`.trim()} aria-hidden="true">
        <span className="text-[10px] font-bold tabular-nums tracking-[0.08em] text-sand-600">
          {display.year}
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

  const durationMinutesLabel =
    display.durationMinutes > 0
      ? t("sessionDurationMinutes", { minutes: display.durationMinutes })
      : null;

  if (variant === "listTimeCard") {
    return (
      <SessionDateTimeListTimeCard
        display={display}
        untilLabel={t("sessionUntil")}
        durationMinutesLabel={durationMinutesLabel}
        className={className}
      />
    );
  }

  return (
    <SessionDateTimeListTimeBlock
      display={display}
      untilLabel={t("sessionUntil")}
      durationMinutesLabel={durationMinutesLabel}
      size={variant === "weekTime" ? "emphasis" : "default"}
      className={className}
    />
  );
}
