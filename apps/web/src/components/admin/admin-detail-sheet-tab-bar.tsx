"use client";

import { useId, type ReactNode } from "react";
import { LayoutGroup } from "framer-motion";
import { ADMIN_HIDE_SCROLLBAR_CLASS } from "@/components/admin/admin-details-sheet-layout";
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
  /** `compact`: default look + scroll on phone; filled row from tablet up (client 7-tab set). */
  density?: OliveSegmentedHugDensity;
  trailing?: ReactNode;
};

const SHEET_TAB_PILL_LAYOUT_ID = "admin-detail-sheet-olive-segmented-pill";

const TAB_BAR_PADDING_CLASS = {
  compact: "px-3 py-2.5 min-[744px]:px-2 min-[744px]:py-2.5",
  default: "px-3 py-2.5 sm:px-4 sm:py-3",
} as const;

const TAB_SCROLL_CLASS = [
  "min-w-0 flex-1 overflow-x-auto overscroll-x-contain touch-pan-x",
  ADMIN_HIDE_SCROLLBAR_CLASS,
].join(" ");

function AdminDetailSheetTabList({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  density,
}: {
  tabs: readonly AdminDetailSheetTabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  ariaLabel: string;
  density: OliveSegmentedHugDensity;
}) {
  return (
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
  );
}

/** Detail-sheet section tabs — olive hug switcher (client, coach, gift card, session). */
export function AdminDetailSheetTabBar({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ariaLabel = "Sheet sections",
  density = "default",
  trailing,
}: AdminDetailSheetTabBarProps) {
  const layoutGroupId = useId();

  return (
    <div
      className={`${TAB_BAR_PADDING_CLASS[density]} flex min-w-0 shrink-0 items-center gap-2 border-b border-white/60 ${className}`.trim()}
    >
      <div className={TAB_SCROLL_CLASS}>
        <LayoutGroup id={layoutGroupId}>
          <AdminDetailSheetTabList
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            ariaLabel={ariaLabel}
            density={density}
          />
        </LayoutGroup>
      </div>
      {trailing ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}
