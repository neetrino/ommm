"use client";

import { useTranslations } from "next-intl";
import {
  SCHEDULE_LAYOUT_MODES,
  type ScheduleLayoutMode,
} from "@/lib/schedule-layout-mode";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";
import styles from "@/components/marketing/schedule/schedule-layout-switcher.module.css";

const LAYOUT_COLUMN_COUNT = 2;

const LAYOUT_LABEL_KEY: Record<ScheduleLayoutMode, "layoutList" | "layoutWeek"> =
  {
    list: "layoutList",
    week: "layoutWeek",
  };

type ScheduleLayoutSwitcherProps = {
  value: ScheduleLayoutMode;
  onChange: (mode: ScheduleLayoutMode) => void;
  className?: string;
};

/** List / Week segmented control for the public schedule desktop layout. */
export function ScheduleLayoutSwitcher({
  value,
  onChange,
  className = "",
}: ScheduleLayoutSwitcherProps) {
  const t = useTranslations("marketingPages.schedule");
  const activeIndex = Math.max(0, SCHEDULE_LAYOUT_MODES.indexOf(value));

  return (
    <div
      role="tablist"
      aria-label={t("layoutSwitcherAria")}
      className={`${oliveSegmentedTrackClass(LAYOUT_COLUMN_COUNT, styles.track)} ${className}`.trim()}
    >
      <span
        aria-hidden
        className={oliveSegmentedThumbClass(LAYOUT_COLUMN_COUNT, activeIndex)}
      />
      {SCHEDULE_LAYOUT_MODES.map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            className={oliveSegmentedSegmentClassName(
              active,
              LAYOUT_COLUMN_COUNT,
            )}
            onClick={() => onChange(mode)}
          >
            {t(LAYOUT_LABEL_KEY[mode])}
          </button>
        );
      })}
    </div>
  );
}
