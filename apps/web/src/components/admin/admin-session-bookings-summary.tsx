"use client";

import { useTranslations } from "next-intl";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import {
  durationMinutes,
  spotsLeft,
} from "@/components/admin/admin-schedule-session-display";

const SUMMARY_SEPARATOR = " · ";

type AdminSessionBookingsSummaryProps = {
  row: AdminScheduleSession;
};

/** One-line capacity snapshot for the session sheet Bookings tab. */
export function AdminSessionBookingsSummary({ row }: AdminSessionBookingsSummaryProps) {
  const t = useTranslations("adminPages.classes");
  const parts = [
    `${row._count.bookings}/${row.capacity}`,
    t("fields.spotsLeft", { count: spotsLeft(row) }),
    `${durationMinutes(row)}m`,
  ];

  return <p className="text-sm text-sage-600">{parts.join(SUMMARY_SEPARATOR)}</p>;
}
