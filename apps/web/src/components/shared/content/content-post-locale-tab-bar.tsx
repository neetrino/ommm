"use client";

import type { ReactNode } from "react";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import { CONTENT_POST_TITLE_FONT_CLASS } from "@/components/shared/content/content-post-display-helpers";
import type { ContentPostLocale } from "@/components/shared/content/content-post-types";
import {
  oliveSegmentedFillSegmentClassName,
  oliveSegmentedFillTrackClass,
  oliveSegmentedThumbClass,
  type OliveSegmentedColumnCount,
} from "@/components/ui/olive-segmented-switcher";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";

export type ContentPostLocaleTabItem = {
  value: ContentPostLocale;
  label: string;
};

type ContentPostLocaleTabBarProps = {
  tabs: readonly ContentPostLocaleTabItem[];
  activeTab: ContentPostLocale;
  onTabChange: (value: ContentPostLocale) => void;
  ariaLabel: string;
  trailing?: ReactNode;
};

const CONTENT_POST_LOCALE_SWITCHER_COLUMN_COUNT = 3 satisfies OliveSegmentedColumnCount;

function isContentPostLocale(value: string): value is ContentPostLocale {
  return value === "en" || value === "ru" || value === "hy";
}

function ContentPostLocaleFillSwitcher({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
}: Omit<ContentPostLocaleTabBarProps, "trailing">) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === activeTab),
  );

  return (
    <div className="min-w-0 shrink-0 border-b border-white/60 px-3 py-2.5">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={oliveSegmentedFillTrackClass(
          CONTENT_POST_LOCALE_SWITCHER_COLUMN_COUNT,
          "border border-[rgb(151_144_124_/_0.35)]",
        )}
      >
        <span
          aria-hidden
          className={oliveSegmentedThumbClass(
            CONTENT_POST_LOCALE_SWITCHER_COLUMN_COUNT,
            activeIndex,
          )}
        />
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={oliveSegmentedFillSegmentClassName(isActive)}
              onClick={() => onTabChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** English / Russian / Armenian — olive sheet switcher. */
export function ContentPostLocaleTabBar({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  trailing,
}: ContentPostLocaleTabBarProps) {
  const isPhone = useMemberHubSheetPhone();

  if (isPhone) {
    return (
      <ContentPostLocaleFillSwitcher
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        ariaLabel={ariaLabel}
      />
    );
  }

  return (
    <AdminDetailSheetTabBar
      tabs={tabs}
      activeTab={activeTab}
      ariaLabel={ariaLabel}
      trailing={trailing}
      onTabChange={(value) => {
        if (isContentPostLocale(value)) {
          onTabChange(value);
        }
      }}
    />
  );
}

export const CONTENT_POST_SHEET_TITLE_INPUT_CLASS =
  `w-full min-w-0 border-0 bg-transparent p-0 text-2xl ${CONTENT_POST_TITLE_FONT_CLASS} placeholder:text-sage-400 focus:outline-none focus:ring-0 disabled:opacity-60`;
