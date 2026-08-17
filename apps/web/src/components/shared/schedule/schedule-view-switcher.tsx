"use client";

import { useTranslations } from "next-intl";
import { AdminScheduleViewModeIcon } from "@/components/admin/admin-schedule-view-icons";
import {
  resolveScheduleView,
  SCHEDULE_VIEW_MODES,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";

const SCHEDULE_MOBILE_VIEW_MODES: readonly ScheduleView[] = ["list", "monthly"];

const VIEW_BUTTON_BASE = [
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2",
  "rounded-full border border-white/70 bg-white/80 px-3.5 text-sm font-semibold text-sage-700",
  "shadow-sm backdrop-blur-sm",
  "transition-[background-color,color,box-shadow,transform]",
  "hover:bg-white hover:text-sage-900 active:scale-[0.97]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

const VIEW_BUTTON_ACTIVE = "border-white/90 bg-white text-sage-900 shadow-md";

type ScheduleViewSwitcherProps = {
  value: ScheduleView;
  onChange: (view: ScheduleView) => void;
};

/** Labeled List / Week / Month toggles — phone shows List + Month only. */
export function ScheduleViewSwitcher({ value, onChange }: ScheduleViewSwitcherProps) {
  const t = useTranslations("adminPages.classes");
  const supportsDesktopViews = useSupportsListBoardView();
  const modes = supportsDesktopViews ? SCHEDULE_VIEW_MODES : SCHEDULE_MOBILE_VIEW_MODES;

  const labels: Record<ScheduleView, string> = {
    list: t("views.list"),
    weekly: t("views.weekly"),
    monthly: t("views.monthly"),
  };

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label={t("views.aria")}
    >
      {modes.map((nextView) => {
        const active = value === nextView;
        return (
          <button
            key={nextView}
            type="button"
            aria-label={labels[nextView]}
            aria-pressed={active}
            title={labels[nextView]}
            className={`${VIEW_BUTTON_BASE} ${active ? VIEW_BUTTON_ACTIVE : ""}`}
            onClick={() => onChange(resolveScheduleView(nextView))}
          >
            <AdminScheduleViewModeIcon view={nextView} className="h-4 w-4 shrink-0" />
            <span>{labels[nextView]}</span>
          </button>
        );
      })}
    </div>
  );
}
