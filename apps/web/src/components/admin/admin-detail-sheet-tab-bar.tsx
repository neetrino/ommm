"use client";

import { useId } from "react";
import { LayoutGroup } from "framer-motion";
import { OliveSegmentedActiveThumb } from "@/components/ui/olive-segmented-active-thumb";
import {
  oliveSegmentedHugSegmentClassName,
  oliveSegmentedHugTrackClass,
  type OliveSegmentedHugDensity,
} from "@/components/ui/olive-segmented-switcher";

export type AdminDetailSheetTabItem = {
  value: string;
  label: string;
};

type AdminDetailSheetTabBarProps = {
  tabs: readonly AdminDetailSheetTabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  /** `compact` fills one full-width row (client 7-tab set). */
  density?: OliveSegmentedHugDensity;
};

const SHEET_TAB_PILL_LAYOUT_ID = "admin-detail-sheet-olive-segmented-pill";

/** Detail-sheet section tabs — olive hug switcher (client, coach, gift card, session). */
export function AdminDetailSheetTabBar({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ariaLabel = "Sheet sections",
  density = "default",
}: AdminDetailSheetTabBarProps) {
  const layoutGroupId = useId();

  return (
    <div
      className={`${density === "compact" ? "px-2 py-2.5 sm:px-3" : "px-3 py-2.5 sm:px-4 sm:py-3"} min-w-0 shrink-0 border-b border-white/60 ${className}`.trim()}
    >
      <LayoutGroup id={layoutGroupId}>
        <div
          role="tablist"
          aria-label={ariaLabel}
          className={oliveSegmentedHugTrackClass(
            "border border-[rgb(151_144_124_/_0.35)]",
            density,
          )}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={oliveSegmentedHugSegmentClassName(isActive, density)}
                onClick={() => onTabChange(tab.value)}
              >
                {isActive ? (
                  <OliveSegmentedActiveThumb layoutId={SHEET_TAB_PILL_LAYOUT_ID} />
                ) : null}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
