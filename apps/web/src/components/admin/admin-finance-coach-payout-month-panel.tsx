"use client";

import { useEffect, useMemo, useRef, useState, type TransitionEvent } from "react";
import { useTranslations } from "next-intl";
import {
  formatYearMonth,
} from "@/components/admin/admin-schedule-month-utils";
import { formatScheduleMonthTitle } from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/marketing/schedule/schedule-date-month-panel.module.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const MONTH_COUNT = 12;
const POPOVER_EXIT_FALLBACK_MS = 560;
const MONTH_GRID_INDEXES = Array.from({ length: MONTH_COUNT }, (_, index) => index);

type AdminFinanceCoachPayoutMonthPanelProps = {
  locale: string;
  selectedMonth: string;
  maxMonth: string;
  open?: boolean;
  onSelectMonth: (month: string) => void;
  onExitComplete?: () => void;
};

function yearFromYearMonth(yearMonth: string): number {
  return Number.parseInt(yearMonth.slice(0, 4), 10);
}

/**
 * Centered month grid under the payout month pill — pick any month in a year.
 */
export function AdminFinanceCoachPayoutMonthPanel({
  locale,
  selectedMonth,
  maxMonth,
  open = true,
  onSelectMonth,
  onExitComplete,
}: AdminFinanceCoachPayoutMonthPanelProps) {
  const t = useTranslations("adminPages.finance.coachPayoutHistory");
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const exitCompletedRef = useRef(false);
  const [visibleYear, setVisibleYear] = useState(() => yearFromYearMonth(selectedMonth));
  const maxYear = yearFromYearMonth(maxMonth);

  useEffect(() => {
    setVisibleYear(yearFromYearMonth(selectedMonth));
  }, [selectedMonth]);

  useEffect(() => {
    if (open) {
      exitCompletedRef.current = false;
    }

    if (!open) {
      const exitId = window.requestAnimationFrame(() => {
        setVisible(false);
      });
      return () => window.cancelAnimationFrame(exitId);
    }

    if (reducedMotion) {
      const enterId = window.requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(enterId);
    }

    let innerId = 0;
    const outerId = window.requestAnimationFrame(() => {
      innerId = window.requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    return () => {
      window.cancelAnimationFrame(outerId);
      window.cancelAnimationFrame(innerId);
    };
  }, [open, reducedMotion]);

  useEffect(() => {
    if (open || onExitComplete === undefined || reducedMotion) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      if (exitCompletedRef.current) {
        return;
      }
      exitCompletedRef.current = true;
      onExitComplete();
    }, POPOVER_EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timeoutId);
  }, [open, onExitComplete, reducedMotion]);

  const monthLabels = useMemo(
    () =>
      MONTH_GRID_INDEXES.map((monthIndex) =>
        formatScheduleMonthTitle(locale, new Date(visibleYear, monthIndex, 1)),
      ),
    [locale, visibleYear],
  );

  const canPrevYear = visibleYear > maxYear - 20;
  const canNextYear = visibleYear < maxYear;

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>): void {
    if (event.propertyName !== "opacity" || open || exitCompletedRef.current) {
      return;
    }
    exitCompletedRef.current = true;
    onExitComplete?.();
  }

  return (
    <div
      role="dialog"
      aria-label={t("monthPickerAria")}
      className={[
        styles.popover,
        styles.popoverCenter,
        styles.popoverAnimated,
        visible ? styles.popoverAnimatedVisible : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.header}>
        <p className={styles.monthTitle}>{visibleYear}</p>
        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={t("prevYearAria")}
            disabled={!canPrevYear}
            onClick={() => setVisibleYear((year) => year - 1)}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={t("nextYearAria")}
            disabled={!canNextYear}
            onClick={() => setVisibleYear((year) => year + 1)}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MONTH_GRID_INDEXES.map((monthIndex) => {
          const value = formatYearMonth(visibleYear, monthIndex);
          const selected = value === selectedMonth;
          const disabled = value > maxMonth;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              className={[
                "rounded-full px-2 py-2.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-sage-700 text-white"
                  : "text-sage-800 hover:bg-sand-100",
                disabled ? "cursor-not-allowed opacity-35 hover:bg-transparent" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectMonth(value)}
            >
              {monthLabels[monthIndex]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
