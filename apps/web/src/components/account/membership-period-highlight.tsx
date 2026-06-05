"use client";

import { useTranslations } from "next-intl";
import {
  buildSessionDateTimeDisplay,
  type SessionDateTimeDisplay,
} from "@/lib/session-datetime-display";
import { formatDateForUi } from "@/lib/date-display";

type MembershipPeriodHighlightProps = {
  locale: string;
  periodStart: string;
  periodEnd: string;
  variant: "board" | "list";
  className?: string;
};

const BOARD_SHELL =
  "rounded-2xl border border-sand-200/70 bg-gradient-to-br from-sand-50/95 via-white/90 to-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

const CALENDAR_CHIP_BOARD =
  "flex min-w-[4.25rem] flex-col items-center justify-center rounded-2xl border border-white/90 bg-white px-3 py-2.5 shadow-sm";

const CALENDAR_FLOAT_LIST =
  "flex w-[2.75rem] shrink-0 flex-col items-center justify-center text-center";

function CalendarChipBoard({ display }: { display: SessionDateTimeDisplay }) {
  return (
    <div className={CALENDAR_CHIP_BOARD} aria-hidden="true">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sand-600">
        {display.weekdayShort}
      </span>
      <span className="font-serif text-[2rem] leading-none text-sage-950">{display.dayNumber}</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-sage-600">
        {display.monthShort}
      </span>
    </div>
  );
}

function CalendarChipListYear({ display }: { display: SessionDateTimeDisplay }) {
  return (
    <div className={CALENDAR_FLOAT_LIST} aria-hidden="true">
      <span className="text-[10px] font-bold tabular-nums tracking-[0.08em] text-sand-600">
        {display.year}
      </span>
      <span className="font-serif text-2xl leading-none text-sage-950">{display.dayNumber}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-sage-600">
        {display.monthShort}
      </span>
    </div>
  );
}

function PeriodRangeDash() {
  return (
    <span
      className="shrink-0 font-serif text-lg leading-none text-sand-400"
      aria-hidden="true"
    >
      –
    </span>
  );
}

export function MembershipPeriodHighlight({
  locale,
  periodStart,
  periodEnd,
  variant,
  className = "",
}: MembershipPeriodHighlightProps) {
  const tPackages = useTranslations("userPages.packages");
  const startDisplay = buildSessionDateTimeDisplay(locale, periodStart, periodStart);
  const endDisplay = buildSessionDateTimeDisplay(locale, periodEnd, periodEnd);

  if (startDisplay === null || endDisplay === null) {
    return null;
  }

  const ariaLabel = `${formatDateForUi(periodStart)} – ${formatDateForUi(periodEnd)}`;

  if (variant === "list") {
    return (
      <div
        className={`flex min-w-0 items-center gap-2 ${className}`.trim()}
        aria-label={ariaLabel}
      >
        <CalendarChipListYear display={startDisplay} />
        <PeriodRangeDash />
        <CalendarChipListYear display={endDisplay} />
      </div>
    );
  }

  return (
    <div className={`${BOARD_SHELL} ${className}`.trim()} aria-label={ariaLabel}>
      <div className="flex items-end justify-center gap-4">
        <div className="text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sage-500">
            {tPackages("membershipDetailsPeriodStart")}
          </p>
          <CalendarChipBoard display={startDisplay} />
        </div>
        <PeriodRangeDash />
        <div className="text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sage-500">
            {tPackages("membershipDetailsPeriodEnd")}
          </p>
          <CalendarChipBoard display={endDisplay} />
        </div>
      </div>
    </div>
  );
}
