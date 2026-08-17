"use client";

import { useTranslations } from "next-intl";
import { formatMonthTitle } from "@/components/admin/admin-schedule-month-utils";

const MONTH_NAV_BUTTON_CLASS = [
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
  "border border-white/70 bg-white/80 text-sage-800 shadow-sm",
  "transition-[background-color,transform] hover:bg-white active:scale-[0.97]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40",
].join(" ");

function MonthNavChevron({ direction }: { direction: "prev" | "next" }) {
  const isPrev = direction === "prev";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {isPrev ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

type AdminScheduleMonthNavProps = {
  locale: string;
  /** Visible month as `YYYY-MM`. */
  yearMonth: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

/** Month title + prev/next controls for the schedule monthly list view. */
export function AdminScheduleMonthNav({
  locale,
  yearMonth,
  onPreviousMonth,
  onNextMonth,
}: AdminScheduleMonthNavProps) {
  const t = useTranslations("adminPages.schedule");
  const monthTitle = formatMonthTitle(locale, yearMonth);

  return (
    <div
      className="flex items-center justify-center gap-3 rounded-[28px] border border-white/70 bg-white/55 px-4 py-3 shadow-[0_18px_44px_-30px_rgba(45,40,35,0.3)] backdrop-blur-md"
      aria-label={t("monthView.gridAria", { month: monthTitle })}
    >
      <button
        type="button"
        className={MONTH_NAV_BUTTON_CLASS}
        aria-label={t("monthView.previousMonth")}
        onClick={onPreviousMonth}
      >
        <MonthNavChevron direction="prev" />
      </button>
      <h2 className="min-w-0 truncate text-center font-serif text-xl font-semibold capitalize text-sage-950 sm:text-2xl">
        {monthTitle}
      </h2>
      <button
        type="button"
        className={MONTH_NAV_BUTTON_CLASS}
        aria-label={t("monthView.nextMonth")}
        onClick={onNextMonth}
      >
        <MonthNavChevron direction="next" />
      </button>
    </div>
  );
}
