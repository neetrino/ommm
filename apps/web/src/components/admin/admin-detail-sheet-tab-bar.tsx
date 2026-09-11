"use client";

import { useId } from "react";
import { LayoutGroup } from "framer-motion";
import {
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_HORIZONTAL_TAB_SCROLL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OliveSegmentedActiveThumb } from "@/components/ui/olive-segmented-active-thumb";
import {
  oliveSegmentedHugSegmentClassName,
  oliveSegmentedHugTrackClass,
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
};

const SHEET_TAB_PILL_LAYOUT_ID = "admin-detail-sheet-olive-segmented-pill";

/** Detail-sheet section tabs — olive hug switcher (client, coach, gift card, session). */
export function AdminDetailSheetTabBar({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ariaLabel = "Sheet sections",
}: AdminDetailSheetTabBarProps) {
  const layoutGroupId = useId();

  return (
    <div
      className={`${ADMIN_DETAILS_SHEET_HEADER_CLASS} shrink-0 border-b border-t-0 py-3 ${className}`.trim()}
    >
      <div className={ADMIN_HORIZONTAL_TAB_SCROLL_CLASS}>
        <LayoutGroup id={layoutGroupId}>
          <div
            role="tablist"
            aria-label={ariaLabel}
            className={oliveSegmentedHugTrackClass("border border-[rgb(151_144_124_/_0.35)]")}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={oliveSegmentedHugSegmentClassName(isActive)}
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
    </div>
  );
}
