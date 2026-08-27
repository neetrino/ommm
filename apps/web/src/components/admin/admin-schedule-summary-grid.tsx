"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { AdminScheduleSummary } from "@/components/admin/admin-schedule-session.types";

type SummaryGridProps = {
  summary: AdminScheduleSummary;
};

export function SummaryGrid({ summary }: SummaryGridProps) {
  const t = useTranslations("adminPages.classes.summary");
  return (
    <div className={adminChrome.summaryGridSix}>
      {(["total", "active", "upcoming", "full", "cancelled", "draft"] as const).map((key) => (
        <div key={key} className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t(key)}</p>
          <p className={adminChrome.metricValue}>{summary[key]}</p>
        </div>
      ))}
    </div>
  );
}
