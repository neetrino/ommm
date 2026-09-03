"use client";

import { useTranslations } from "next-intl";
import { SESSION_BOOKED_BUTTON_SCHEDULE_SM_CLASS } from "@/components/account/session-booked-badge";
import styles from "@/components/marketing/schedule/schedule-session-booked-header-badge.module.css";

/** Mobile schedule row — booked pill in the header status slot. */
export function ScheduleSessionBookedHeaderBadge() {
  const t = useTranslations("userPages.classes");

  return (
    <span className={`${SESSION_BOOKED_BUTTON_SCHEDULE_SM_CLASS} ${styles.badge}`}>
      {t("bookedBadge")}
    </span>
  );
}
