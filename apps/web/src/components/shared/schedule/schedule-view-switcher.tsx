"use client";

import { useTranslations } from "next-intl";
import { AdminScheduleViewModeIcon } from "@/components/admin/admin-schedule-view-icons";
import {
  resolveScheduleView,
  SCHEDULE_VIEW_MODES,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import {
  oliveSegmentedFillSegmentClassName,
  oliveSegmentedFillTrackClass,
  oliveSegmentedThumbClass,
} from "@/components/ui/olive-segmented-switcher";

const VIEW_SWITCHER_COLUMN_COUNT = 3;

const VIEW_SWITCHER_SHELL_CLASS = "flex w-full md:justify-center";

const VIEW_SWITCHER_TRACK_CLASS = oliveSegmentedFillTrackClass(
  VIEW_SWITCHER_COLUMN_COUNT,
  "w-full md:w-max",
);

function scheduleViewSegmentClassName(active: boolean): string {
  return [
    oliveSegmentedFillSegmentClassName(active),
    "gap-1.5 md:min-w-[6.75rem] md:gap-2 md:px-5",
  ].join(" ");
}

type ScheduleViewSwitcherProps = {
  value: ScheduleView;
  onChange: (view: ScheduleView) => void;
};

/** List / Week / Month olive segmented switcher — full width on phone, centered on desktop. */
export function ScheduleViewSwitcher({ value, onChange }: ScheduleViewSwitcherProps) {
  const t = useTranslations("adminPages.classes");
  const activeIndex = Math.max(0, SCHEDULE_VIEW_MODES.indexOf(value));

  const labels: Record<ScheduleView, string> = {
    list: t("views.list"),
    weekly: t("views.weekly"),
    monthly: t("views.monthly"),
  };

  return (
    <div className={VIEW_SWITCHER_SHELL_CLASS}>
      <div
        role="tablist"
        aria-label={t("views.aria")}
        className={VIEW_SWITCHER_TRACK_CLASS}
      >
        <span
          aria-hidden
          className={oliveSegmentedThumbClass(VIEW_SWITCHER_COLUMN_COUNT, activeIndex)}
        />
        {SCHEDULE_VIEW_MODES.map((nextView) => {
          const active = value === nextView;
          return (
            <button
              key={nextView}
              type="button"
              role="tab"
              aria-selected={active}
              className={scheduleViewSegmentClassName(active)}
              onClick={() => onChange(resolveScheduleView(nextView))}
            >
              <AdminScheduleViewModeIcon view={nextView} className="h-4 w-4 shrink-0" />
              <span>{labels[nextView]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
