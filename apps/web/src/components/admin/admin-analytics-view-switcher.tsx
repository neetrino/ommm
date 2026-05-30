"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { AnalyticsViewMode } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsViewSwitcherProps = {
  value: AnalyticsViewMode;
  onChange: (mode: AnalyticsViewMode) => void;
};

const SEGMENT_BASE =
  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_BASE} bg-white text-sage-900 shadow-sm`
    : `${SEGMENT_BASE} text-sage-600 hover:bg-white/50 hover:text-sage-900`;
}

export function AdminAnalyticsViewSwitcher({
  value,
  onChange,
}: AdminAnalyticsViewSwitcherProps) {
  const t = useTranslations("adminPages.analytics");

  return (
    <div
      role="group"
      aria-label={t("viewSwitcherAria")}
      className="inline-flex rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md"
    >
      <button
        type="button"
        aria-pressed={value === "table"}
        className={segmentClassName(value === "table")}
        onClick={() => onChange("table")}
      >
        <DashboardNavIcon name="listOrdered" className="h-4 w-4 shrink-0" />
        {t("viewTable")}
      </button>
      <button
        type="button"
        aria-pressed={value === "chart"}
        className={segmentClassName(value === "chart")}
        onClick={() => onChange("chart")}
      >
        <DashboardNavIcon name="barChart" className="h-4 w-4 shrink-0" />
        {t("viewChart")}
      </button>
    </div>
  );
}
