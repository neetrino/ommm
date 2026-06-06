"use client";

import { useTranslations } from "next-intl";
import {
  AdminCalendarViewSwitcher,
  type AdminCalendarView,
} from "@/components/admin/admin-calendar-view-switcher";
import type { BookingsView } from "@/components/admin/admin-bookings-view-icons";

type AdminBookingsViewSwitcherProps = {
  value: BookingsView;
  onChange: (view: BookingsView) => void;
};

export function AdminBookingsViewSwitcher({ value, onChange }: AdminBookingsViewSwitcherProps) {
  const t = useTranslations("adminPages.bookings");

  return (
    <AdminCalendarViewSwitcher
      value={value}
      onChange={onChange}
      labels={{
        groupAria: t("views.aria"),
        list: t("viewList"),
        monthly: t("viewMonthly"),
        weekly: t("viewWeekly"),
        daily: t("viewDaily"),
      }}
    />
  );
}

export type { AdminCalendarView };
