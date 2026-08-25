"use client";

import { useTranslations } from "next-intl";
import type { StaffActivityType } from "@/lib/staff-activity-types";

export function staffActivityActionToneClass(type: StaffActivityType): string {
  return type === "BOOKING_CREATED"
    ? "font-semibold text-emerald-700"
    : "font-semibold text-rose-700";
}

export function StaffActivityTypeLabel({ type }: { type: StaffActivityType }) {
  const t = useTranslations("staffActivityPages");
  const label = type === "BOOKING_CREATED" ? t("typeBooked") : t("typeCancelled");
  return <span className={staffActivityActionToneClass(type)}>{label}</span>;
}

export function StaffActivityCardBody({ type }: { type: StaffActivityType }) {
  const t = useTranslations("staffActivityPages");
  const key = type === "BOOKING_CREATED" ? "cardBodyBooked" : "cardBodyCancelled";
  return (
    <>
      {t.rich(key, {
        hl: (chunks) => (
          <span className={staffActivityActionToneClass(type)}>{chunks}</span>
        ),
      })}
    </>
  );
}
