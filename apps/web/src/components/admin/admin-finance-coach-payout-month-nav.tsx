"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  addCalendarMonths,
  dateFromYearMonth,
} from "@/components/admin/admin-schedule-month-utils";
import { AdminFinanceCoachPayoutMonthPanel } from "@/components/admin/admin-finance-coach-payout-month-panel";
import { formatScheduleMonthTitle } from "@/components/marketing/schedule/schedule-date-utils";
import { useSchedulePopoverMotion } from "@/components/marketing/schedule/use-schedule-popover-motion";
import { useDismissWhenOutside } from "@/hooks/use-dismiss-when-outside";

type AdminFinanceCoachPayoutMonthNavProps = {
  locale: string;
  month: string;
  onMonthChange: (month: string) => void;
};

const PILL_CLASS = [
  "relative inline-flex items-center gap-1 rounded-full",
  "border border-white/80 bg-white/90 py-1.5 pr-1.5 pl-1.5",
  "shadow-[0_10px_28px_-18px_rgba(45,40,35,0.35)] backdrop-blur-md",
  "transition-[border-color,box-shadow,background-color]",
  "hover:border-sand-500/35 hover:bg-white",
  "hover:shadow-[0_16px_34px_-18px_rgba(107,92,76,0.42)]",
].join(" ");

const NAV_BTN_CLASS = [
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
  "text-sage-700 transition-[background-color,color,transform]",
  "hover:bg-sand-100 hover:text-sand-700",
  "active:scale-95",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50",
  "disabled:pointer-events-none disabled:opacity-35",
].join(" ");

const LABEL_BTN_CLASS = [
  "inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-full px-3 py-1.5",
  "font-serif text-base font-semibold tracking-tight text-sage-900",
  "transition-colors hover:bg-sand-50/80",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40",
].join(" ");

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthNavLabel(locale: string, yearMonth: string): string {
  const date = dateFromYearMonth(yearMonth);
  return `${formatScheduleMonthTitle(locale, date)} ${date.getFullYear()}`;
}

function MonthCalendarGlyph() {
  return (
    <span
      className={[
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-sand-500 to-sand-700 text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_14px_-8px_rgba(107,92,76,0.55)]",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden
      >
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
      </svg>
    </span>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 6l-6 6 6 6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

/** Glass pill month navigator for coach salary payout history. */
export function AdminFinanceCoachPayoutMonthNav({
  locale,
  month,
  onMonthChange,
}: AdminFinanceCoachPayoutMonthNavProps) {
  const t = useTranslations("adminPages.finance.coachPayoutHistory");
  const maxMonth = currentYearMonth();
  const canShiftNext = month < maxMonth;
  const pickerRef = useRef<HTMLDivElement>(null);
  const calendarMotion = useSchedulePopoverMotion();

  useDismissWhenOutside(calendarMotion.open, pickerRef, calendarMotion.hide);

  return (
    <div
      className={[
        "relative z-[1] flex justify-center",
        calendarMotion.mounted ? "z-[90]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div ref={pickerRef} className={PILL_CLASS}>
        <span
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sand-300/80 to-transparent"
          aria-hidden
        />
        <button
          type="button"
          className={NAV_BTN_CLASS}
          aria-label={t("prevMonthAria")}
          onClick={() => onMonthChange(addCalendarMonths(month, -1))}
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          className={LABEL_BTN_CLASS}
          aria-label={t("monthPickerAria")}
          aria-expanded={calendarMotion.open}
          onClick={() => calendarMotion.toggle()}
        >
          <MonthCalendarGlyph />
          <span>{formatMonthNavLabel(locale, month)}</span>
        </button>
        <button
          type="button"
          className={NAV_BTN_CLASS}
          aria-label={t("nextMonthAria")}
          disabled={!canShiftNext}
          onClick={() => onMonthChange(addCalendarMonths(month, 1))}
        >
          <ChevronIcon direction="right" />
        </button>
        {calendarMotion.mounted ? (
          <AdminFinanceCoachPayoutMonthPanel
            locale={locale}
            selectedMonth={month}
            maxMonth={maxMonth}
            open={calendarMotion.open}
            onSelectMonth={(nextMonth) => {
              onMonthChange(nextMonth);
              calendarMotion.hide();
            }}
            onExitComplete={calendarMotion.onExitComplete}
          />
        ) : null}
      </div>
    </div>
  );
}
