"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  addCalendarMonths,
  dateFromYearMonth,
} from "@/components/admin/admin-schedule-month-utils";
import { currentStudioSalaryMonth } from "@/components/coaches/coach-salary-month";
import { formatScheduleMonthTitle } from "@/components/marketing/schedule/schedule-date-utils";
import { usePathname, useRouter } from "@/i18n/navigation";

type CoachSalaryMonthNavProps = {
  locale: string;
  month: string;
};

function formatMonthLabel(locale: string, yearMonth: string): string {
  const date = dateFromYearMonth(yearMonth);
  return `${formatScheduleMonthTitle(locale, date)} ${date.getFullYear()}`;
}

function replaceMonthQuery(
  search: string,
  nextMonth: string,
  currentMonth: string,
): string {
  const params = new URLSearchParams(search);
  if (nextMonth === currentMonth) {
    params.delete("month");
  } else {
    params.set("month", nextMonth);
  }
  return params.toString();
}

export function CoachSalaryMonthNav({ locale, month }: CoachSalaryMonthNavProps) {
  const t = useTranslations("coachPages.salary");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const currentMonth = currentStudioSalaryMonth();
  const canShiftNext = month < currentMonth;

  const go = (nextMonth: string) => {
    const query = replaceMonthQuery(
      searchParams.toString(),
      nextMonth,
      currentMonth,
    );
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <div
      className="flex justify-center"
      role="group"
      aria-label={t("monthAria")}
    >
      <div className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/90 px-1.5 py-1.5 shadow-[0_10px_28px_-18px_rgba(45,40,35,0.35)] backdrop-blur-md">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sage-700 transition-colors hover:bg-sand-100 hover:text-sand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50"
          aria-label={t("prevMonthAria")}
          onClick={() => go(addCalendarMonths(month, -1))}
        >
          ‹
        </button>
        <p className="min-w-[11rem] text-center font-serif text-base font-semibold tracking-tight text-sage-900">
          {formatMonthLabel(locale, month)}
        </p>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sage-700 transition-colors hover:bg-sand-100 hover:text-sand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/50 disabled:pointer-events-none disabled:opacity-35"
          aria-label={t("nextMonthAria")}
          disabled={!canShiftNext}
          onClick={() => go(addCalendarMonths(month, 1))}
        >
          ›
        </button>
      </div>
    </div>
  );
}
