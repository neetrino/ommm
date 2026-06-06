"use client";

import {
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
} from "@/components/admin/admin-details-sheet-layout";

export type AdminDetailSheetTabItem = {
  value: string;
  label: string;
};

type AdminDetailSheetTabBarProps = {
  tabs: readonly AdminDetailSheetTabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
};

const TAB_BUTTON_BASE_CLASS =
  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const TAB_BUTTON_ACTIVE_CLASS =
  "border-sage-700 bg-sage-800 text-white shadow-sm";

const TAB_BUTTON_INACTIVE_CLASS =
  "border-white/70 bg-white/50 text-sage-700 hover:border-white hover:bg-white/80 hover:text-sage-900";

export function AdminDetailSheetTabBar({
  tabs,
  activeTab,
  onTabChange,
}: AdminDetailSheetTabBarProps) {
  return (
    <div
      className={`${ADMIN_DETAILS_SHEET_HEADER_CLASS} shrink-0 border-b border-t-0 py-3`}
      role="tablist"
      aria-label="Sheet sections"
    >
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${TAB_BUTTON_BASE_CLASS} ${
                isActive ? TAB_BUTTON_ACTIVE_CLASS : TAB_BUTTON_INACTIVE_CLASS
              }`}
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
