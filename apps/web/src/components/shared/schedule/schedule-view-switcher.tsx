"use client";

import { useTranslations } from "next-intl";
import { AdminCalendarViewSwitcher } from "@/components/admin/admin-calendar-view-switcher";
import {
  resolveScheduleView,
  SCHEDULE_VIEW_MODES,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";

const SCHEDULE_MOBILE_VIEW_MODES: readonly ScheduleView[] = ["list", "monthly"];

type ScheduleViewSwitcherProps = {
  value: ScheduleView;
  onChange: (view: ScheduleView) => void;
};

/** List + Month on phones; List + Week + Month on tablet/desktop. */
export function ScheduleViewSwitcher({ value, onChange }: ScheduleViewSwitcherProps) {
  const t = useTranslations("adminPages.classes");
  const supportsDesktopViews = useSupportsListBoardView();
  const modes = supportsDesktopViews ? SCHEDULE_VIEW_MODES : SCHEDULE_MOBILE_VIEW_MODES;

  return (
    <AdminCalendarViewSwitcher
      value={value}
      onChange={(nextView) => onChange(resolveScheduleView(nextView))}
      modes={modes}
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
