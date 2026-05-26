"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { AdminCoachesViewMode } from "@/lib/admin-coaches-view-preference";

type AdminCoachesViewSwitcherProps = {
  value: AdminCoachesViewMode;
  onChange: (mode: AdminCoachesViewMode) => void;
};

const SEGMENT_BASE =
  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_BASE} bg-white text-sage-900 shadow-sm`
    : `${SEGMENT_BASE} text-sage-600 hover:bg-white/50 hover:text-sage-900`;
}

export function AdminCoachesViewSwitcher({
  value,
  onChange,
}: AdminCoachesViewSwitcherProps) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div
      role="group"
      aria-label={t("viewSwitcherAria")}
      className="inline-flex rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md"
    >
      <button
        type="button"
        aria-pressed={value === "list"}
        className={segmentClassName(value === "list")}
        onClick={() => onChange("list")}
      >
        <DashboardNavIcon name="listOrdered" className="h-4 w-4 shrink-0" />
        {t("viewList")}
      </button>
      <button
        type="button"
        aria-pressed={value === "board"}
        className={segmentClassName(value === "board")}
        onClick={() => onChange("board")}
      >
        <DashboardNavIcon name="layoutGrid" className="h-4 w-4 shrink-0" />
        {t("viewBoard")}
      </button>
    </div>
  );
}
