"use client";

import { useTranslations } from "next-intl";
import { AdminCalendarViewSwitcher } from "@/components/admin/admin-calendar-view-switcher";
import {
  resolveScheduleView,
  SCHEDULE_VIEW_MODES,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";

type ScheduleViewSwitcherProps = {
  value: ScheduleView;
  onChange: (view: ScheduleView) => void;
};

/** List + Week toggle shared across admin, manager, coach, and member schedule pages. */
export function ScheduleViewSwitcher({ value, onChange }: ScheduleViewSwitcherProps) {
  const t = useTranslations("adminPages.classes");

  return (
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
  );
}
