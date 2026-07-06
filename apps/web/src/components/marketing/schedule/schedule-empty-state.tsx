"use client";

import { useTranslations } from "next-intl";
import styles from "@/components/marketing/schedule/schedule-empty-state.module.css";

type ScheduleEmptyStateProps = {
  className?: string;
};

export function ScheduleEmptyState({ className }: ScheduleEmptyStateProps) {
  const t = useTranslations("marketingPages.schedule");

  return (
    <div className={`${styles.emptyState} ${className ?? ""}`}>
      <h3 className={styles.title}>{t("emptyTitle")}</h3>
      <p className={styles.body}>{t("emptyBody")}</p>
    </div>
  );
}
