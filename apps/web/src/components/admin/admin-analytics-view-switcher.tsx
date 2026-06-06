"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { AnalyticsViewMode } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsViewSwitcherProps = {
  value: AnalyticsViewMode;
  onChange: (mode: AnalyticsViewMode) => void;
  compact?: boolean;
};

const SEGMENT_BASE =
  "inline-flex cursor-pointer items-center gap-2 rounded-full font-medium transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean, compact: boolean): string {
  const size = compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm";
  return active
    ? `${SEGMENT_BASE} ${size} bg-white text-sage-900 shadow-sm hover:bg-white hover:shadow-md`
    : `${SEGMENT_BASE} ${size} text-sage-600 hover:bg-white/60 hover:text-sage-900 hover:shadow-sm`;
}

export function AdminAnalyticsViewSwitcher({
  value,
  onChange,
  compact = false,
}: AdminAnalyticsViewSwitcherProps) {
  const t = useTranslations("adminPages.analytics");
  const iconClass = compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0";

  return (
    <div
      role="group"
      aria-label={t("viewSwitcherAria")}
      className={`inline-flex shrink-0 rounded-full border border-white/60 bg-white/55 shadow-sm backdrop-blur-md ${compact ? "p-0.5" : "p-1"}`}
    >
      <button
        type="button"
        aria-pressed={value === "table"}
        className={segmentClassName(value === "table", compact)}
        onClick={() => onChange("table")}
      >
        <DashboardNavIcon name="listOrdered" className={iconClass} />
        {!compact ? t("viewTable") : <span className="sr-only">{t("viewTable")}</span>}
      </button>
      <button
        type="button"
        aria-pressed={value === "chart"}
        className={segmentClassName(value === "chart", compact)}
        onClick={() => onChange("chart")}
      >
        <DashboardNavIcon name="barChart" className={iconClass} />
        {!compact ? t("viewChart") : <span className="sr-only">{t("viewChart")}</span>}
      </button>
    </div>
  );
}
