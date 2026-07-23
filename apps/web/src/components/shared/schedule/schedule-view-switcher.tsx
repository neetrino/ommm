"use client";

import { useTranslations } from "next-intl";
import { AdminCalendarViewSwitcher } from "@/components/admin/admin-calendar-view-switcher";
import {
  resolveScheduleView,
  SCHEDULE_VIEW_MODES,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS } from "@/lib/viewport-breakpoints";

type ScheduleViewSwitcherProps = {
  value: ScheduleView;
  onChange: (view: ScheduleView) => void;
};

/** List + Week toggle — tablet/desktop only; phones always use card/list view. */
export function ScheduleViewSwitcher({ value, onChange }: ScheduleViewSwitcherProps) {
  const t = useTranslations("adminPages.classes");

  return (
    <div className={LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS}>
      <AdminCalendarViewSwitcher
        value={value}
        onChange={(nextView) => onChange(resolveScheduleView(nextView))}
        modes={SCHEDULE_VIEW_MODES}
        labels={{
          groupAria: t("views.aria"),
          list: t("views.list"),
          monthly: t("views.monthly"),
          weekly: t("views.weekly"),
          daily: t("views.daily"),
        }}
      />
    </div>
  );
}
