"use client";

import { useTranslations } from "next-intl";
import {
  addCalendarMonths,
  dateFromYearMonth,
} from "@/components/admin/admin-schedule-month-utils";
import { formatScheduleMonthTitle } from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/marketing/schedule/schedule-week-board.module.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";

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

  return (
    <div className={styles.weekPickerRow}>
      <div className={styles.weekPicker}>
        <button
          type="button"
          className={styles.weekPickerBtn}
          aria-label={t("prevMonthAria")}
          onClick={() => onMonthChange(addCalendarMonths(month, -1))}
        >
          <ArrowLeftIcon />
        </button>
        <span className={`${styles.weekPickerLabel} !cursor-default`} aria-live="polite">
          {formatMonthNavLabel(locale, month)}
        </span>
        <button
          type="button"
          className={styles.weekPickerBtn}
          aria-label={t("nextMonthAria")}
          disabled={!canShiftNext}
          onClick={() => onMonthChange(addCalendarMonths(month, 1))}
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
