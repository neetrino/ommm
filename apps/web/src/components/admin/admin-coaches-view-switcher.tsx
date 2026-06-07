"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { AdminCoachesViewMode } from "@/lib/admin-coaches-view-preference";
import { LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS } from "@/lib/viewport-breakpoints";

type AdminCoachesViewSwitcherProps = {
  value: AdminCoachesViewMode;
  onChange: (mode: AdminCoachesViewMode) => void;
};

const SEGMENT_BASE =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_BASE} bg-white text-sage-900 shadow-sm hover:bg-white hover:shadow-md`
    : `${SEGMENT_BASE} text-sage-600 hover:bg-white/60 hover:text-sage-900 hover:shadow-sm`;
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
      className={`${LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS} shrink-0 rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md`}
    >
      <button
        type="button"
        aria-label={t("viewList")}
        title={t("viewList")}
        aria-pressed={value === "list"}
        className={segmentClassName(value === "list")}
        onClick={() => onChange("list")}
      >
        <DashboardNavIcon name="listOrdered" className="h-4 w-4 shrink-0" />
      </button>
      <button
        type="button"
        aria-label={t("viewBoard")}
        title={t("viewBoard")}
        aria-pressed={value === "board"}
        className={segmentClassName(value === "board")}
        onClick={() => onChange("board")}
      >
        <DashboardNavIcon name="layoutGrid" className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}
