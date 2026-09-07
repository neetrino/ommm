"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  addCalendarMonths,
  dateFromYearMonth,
} from "@/components/admin/admin-schedule-month-utils";
import { AdminFinanceCoachPayoutMonthPanel } from "@/components/admin/admin-finance-coach-payout-month-panel";
import { formatScheduleMonthTitle } from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/marketing/schedule/schedule-week-board.module.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import { useSchedulePopoverMotion } from "@/components/marketing/schedule/use-schedule-popover-motion";
import { useDismissWhenOutside } from "@/hooks/use-dismiss-when-outside";

type AdminFinanceCoachPayoutMonthNavProps = {
  locale: string;
  month: string;
  onMonthChange: (month: string) => void;
};

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthNavLabel(locale: string, yearMonth: string): string {
  const date = dateFromYearMonth(yearMonth);
  return `${formatScheduleMonthTitle(locale, date)} ${date.getFullYear()}`;
}

/** Week-range-style pill navigator for salary payout months. */
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
        styles.weekPickerRow,
        calendarMotion.mounted ? styles.weekPickerRowElevated : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div ref={pickerRef} className={styles.weekPicker}>
        <button
          type="button"
          className={styles.weekPickerBtn}
          aria-label={t("prevMonthAria")}
          onClick={() => onMonthChange(addCalendarMonths(month, -1))}
        >
          <ArrowLeftIcon />
        </button>
        <button
          type="button"
          className={styles.weekPickerLabel}
          aria-label={t("monthPickerAria")}
          aria-expanded={calendarMotion.open}
          onClick={() => calendarMotion.toggle()}
        >
          {formatMonthNavLabel(locale, month)}
        </button>
        <button
          type="button"
          className={styles.weekPickerBtn}
          aria-label={t("nextMonthAria")}
          disabled={!canShiftNext}
          onClick={() => onMonthChange(addCalendarMonths(month, 1))}
        >
          <ArrowRightIcon />
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
