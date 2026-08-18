"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { AdminCoachesViewMode } from "@/lib/admin-coaches-view-preference";
import { LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS } from "@/lib/viewport-breakpoints";

type AdminCoachesViewSwitcherProps = {
  value: AdminCoachesViewMode;
  onChange: (mode: AdminCoachesViewMode) => void;
};

const SWITCHER_TRACK_CLASS = [
  LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS,
  "relative shrink-0 rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md",
].join(" ");

const THUMB_CLASS = [
  "pointer-events-none absolute top-1 left-1 h-9 w-9 rounded-full",
  "bg-[var(--ommm-admin-olive)] shadow-sm",
  "transition-transform duration-300 ease-out motion-reduce:transition-none",
].join(" ");

const SEGMENT_CLASS = [
  "relative z-10 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  "active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_CLASS} text-[var(--ommm-admin-cream)]`
    : `${SEGMENT_CLASS} text-sage-600 hover:text-sage-900`;
}

function thumbOffsetClass(value: AdminCoachesViewMode): string {
  return value === "board" ? "translate-x-full" : "translate-x-0";
}

export function AdminCoachesViewSwitcher({
  value,
  onChange,
}: AdminCoachesViewSwitcherProps) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div role="group" aria-label={t("viewSwitcherAria")} className={SWITCHER_TRACK_CLASS}>
      <span aria-hidden className={`${THUMB_CLASS} ${thumbOffsetClass(value)}`} />
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
