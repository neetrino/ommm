"use client";

import { useTranslations } from "next-intl";
import {
  AdminBookingsListViewIcon,
  AdminBookingsViewIcon,
  type BookingsView,
} from "@/components/admin/admin-bookings-view-icons";

/** List, then week → month → year (W / M / Y). */
const VIEW_MODES: readonly BookingsView[] = ["list", "weekly", "monthly", "daily"];

const CALENDAR_VIEW_LETTERS: Partial<Record<BookingsView, string>> = {
  weekly: "W",
  monthly: "M",
  daily: "Y",
};

const VIEW_BUTTON_BASE =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-700 shadow-sm backdrop-blur-sm transition-[background-color,color,box-shadow,transform] hover:bg-white hover:text-sage-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const VIEW_BUTTON_LIST = "w-9";
const VIEW_BUTTON_CALENDAR = "gap-0.5 px-2";

const VIEW_BUTTON_ACTIVE = "border-white/90 bg-white text-sage-900 shadow-md";

type AdminBookingsViewSwitcherProps = {
  value: BookingsView;
  onChange: (view: BookingsView) => void;
};

/** List icon-only; calendar views: week (W), month (M), year (Y). */
export function AdminBookingsViewSwitcher({
  value,
  onChange,
}: AdminBookingsViewSwitcherProps) {
  const t = useTranslations("adminPages.bookings");

  const ariaLabels: Record<BookingsView, string> = {
    list: t("viewList"),
    monthly: t("viewMonthly"),
    weekly: t("viewWeekly"),
    daily: t("viewDaily"),
  };

  return (
    <div
      className="flex shrink-0 items-center gap-1"
      role="group"
      aria-label={t("views.aria")}
    >
      {VIEW_MODES.map((nextView) => {
        const active = value === nextView;
        const letter = CALENDAR_VIEW_LETTERS[nextView];

        return (
          <button
            key={nextView}
            type="button"
            aria-label={ariaLabels[nextView]}
            aria-pressed={active}
            title={ariaLabels[nextView]}
            className={`${VIEW_BUTTON_BASE} ${letter ? VIEW_BUTTON_CALENDAR : VIEW_BUTTON_LIST} ${active ? VIEW_BUTTON_ACTIVE : ""}`}
            onClick={() => onChange(nextView)}
          >
            {letter ? (
              <>
                <AdminBookingsViewIcon view={nextView} className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold leading-none">{letter}</span>
              </>
            ) : (
              <AdminBookingsListViewIcon className="h-4 w-4 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
