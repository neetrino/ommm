"use client";

import { useTranslations } from "next-intl";
import {
  useAdminPageHeaderSticky,
  useAdminStickyHeaderOffset,
} from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";
import { OliveSegmentedActiveThumb } from "@/components/ui/olive-segmented-active-thumb";
import {
  oliveSegmentedHugSegmentClassName,
  oliveSegmentedHugTrackClass,
} from "@/components/ui/olive-segmented-switcher";

const DAILY_FINANCE_PILL_LAYOUT_ID = "daily-finance-today-pill";

type DailyFinanceHeaderProps = {
  /** Already formatted for UI (`DD.MM.YYYY`). */
  dateLabel: string;
};

/** Finance module header (Admin layout) with a single fixed "Today" segment — no filters. */
export function DailyFinanceHeader({ dateLabel }: DailyFinanceHeaderProps) {
  const tFinance = useTranslations("adminPages.finance");
  const t = useTranslations("adminPages.dailyFinance");
  const stickyEnabled = useAdminPageHeaderSticky(true);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 max-sm:justify-center sm:flex-row sm:items-center sm:justify-start">
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-center gap-3 sm:w-auto sm:justify-start">
          <h1 className="ommm-admin-header-title">{tFinance("title")}</h1>
          <div role="tablist" aria-label={tFinance("tabs.aria")} className={oliveSegmentedHugTrackClass()}>
            <span role="tab" aria-selected className={oliveSegmentedHugSegmentClassName(true)}>
              <OliveSegmentedActiveThumb layoutId={DAILY_FINANCE_PILL_LAYOUT_ID} />
              <span className="relative z-10">{t("dateCaption", { date: dateLabel })}</span>
            </span>
          </div>
        </div>
      </div>
    </WorkspaceStickyPageHeader>
  );
}
