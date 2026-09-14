"use client";

import type { ReactNode } from "react";
import type { ContentPostLocale } from "@/components/shared/content/content-post-types";
import { CONTENT_POST_TITLE_FONT_CLASS } from "@/components/shared/content/content-post-display-helpers";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";

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

function isContentPostLocale(value: string): value is ContentPostLocale {
  return value === "en" || value === "ru" || value === "hy";
}

/** English / Russian / Armenian — olive sheet switcher. */
export function ContentPostLocaleTabBar({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  trailing,
}: ContentPostLocaleTabBarProps) {
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
