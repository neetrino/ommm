"use client";

import type { ContentPostLocale } from "@/components/shared/content/content-post-types";
import { CONTENT_POST_TITLE_FONT_CLASS } from "@/components/shared/content/content-post-display-helpers";

export type ContentPostLocaleTabItem = {
  value: ContentPostLocale;
  label: string;
};

type ContentPostLocaleTabBarProps = {
  tabs: readonly ContentPostLocaleTabItem[];
  activeTab: ContentPostLocale;
  onTabChange: (value: ContentPostLocale) => void;
  ariaLabel: string;
};

export const CONTENT_POST_LOCALE_TAB_BAR_CLASS =
  "grid shrink-0 grid-cols-3 border-b border-white/60";

const CONTENT_POST_LOCALE_TAB_BUTTON_CLASS =
  "flex h-11 items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sand-500";

const CONTENT_POST_LOCALE_TAB_ACTIVE_CLASS =
  "bg-[rgba(151,144,124,0.77)] text-[#fbf5d5]";

const CONTENT_POST_LOCALE_TAB_INACTIVE_CLASS =
  "bg-white/50 text-[#97907c] hover:bg-white/80 hover:text-[#6b6452]";

export function ContentPostLocaleTabBar({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
}: ContentPostLocaleTabBarProps) {
  return (
    <div className={CONTENT_POST_LOCALE_TAB_BAR_CLASS} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${CONTENT_POST_LOCALE_TAB_BUTTON_CLASS} ${
              isActive
                ? CONTENT_POST_LOCALE_TAB_ACTIVE_CLASS
                : CONTENT_POST_LOCALE_TAB_INACTIVE_CLASS
            }`}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export const CONTENT_POST_SHEET_TITLE_INPUT_CLASS =
  `w-full min-w-0 border-0 bg-transparent p-0 text-2xl ${CONTENT_POST_TITLE_FONT_CLASS} placeholder:text-sage-400 focus:outline-none focus:ring-0 disabled:opacity-60`;
