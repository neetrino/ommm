"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  MANAGER_FINANCE_SECTION_HREF,
  MANAGER_FINANCE_SECTION_IDS,
  resolveManagerFinanceSection,
} from "@/components/admin/manager-finance-module";
import { ManagerFinancePaymentsFilters } from "@/components/admin/manager-finance-payments-filters";
import {
  useAdminPageHeaderSticky,
  useAdminStickyHeaderOffset,
} from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";
import { OliveSegmentedActiveThumb } from "@/components/ui/olive-segmented-active-thumb";
import {
  oliveSegmentedHugSegmentClassName,
  oliveSegmentedHugTrackClass,
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";

const MANAGER_FINANCE_SWITCHER_COLUMN_COUNT = 2;
const TODAY_PILL_LAYOUT_ID = "manager-finance-today-pill";

type ManagerFinanceHeaderProps = {
  /** Already formatted for UI (`DD.MM.YYYY`). */
  dateLabel: string;
};

/** Admin finance header layout with Overview / Payments tabs and a fixed "today" caption. */
export function ManagerFinanceHeader({ dateLabel }: ManagerFinanceHeaderProps) {
  const tFinance = useTranslations("adminPages.finance");
  const t = useTranslations("adminPages.dailyFinance");
  const stickyEnabled = useAdminPageHeaderSticky(true);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);
  const pathname = usePathname();
  const activeSection = resolveManagerFinanceSection(pathname);
  const activeIndex = MANAGER_FINANCE_SECTION_IDS.indexOf(activeSection);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar overflow-visible flex-col items-stretch gap-3 max-sm:justify-center sm:flex-row sm:items-center sm:justify-start">
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-center gap-3 sm:w-auto sm:justify-start">
          <h1 className="ommm-admin-header-title">{tFinance("title")}</h1>
          <nav
            role="tablist"
            aria-label={tFinance("tabs.aria")}
            className={oliveSegmentedTrackClass(MANAGER_FINANCE_SWITCHER_COLUMN_COUNT)}
          >
            <span
              aria-hidden
              className={oliveSegmentedThumbClass(MANAGER_FINANCE_SWITCHER_COLUMN_COUNT, activeIndex)}
            />
            {MANAGER_FINANCE_SECTION_IDS.map((section) => {
              const active = section === activeSection;
              return (
                <Link
                  key={section}
                  href={MANAGER_FINANCE_SECTION_HREF[section]}
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? "page" : undefined}
                  scroll={false}
                  className={oliveSegmentedSegmentClassName(active, MANAGER_FINANCE_SWITCHER_COLUMN_COUNT)}
                >
                  {tFinance(`tabs.${section}`)}
                </Link>
              );
            })}
          </nav>
        </div>
        {activeSection === "payments" ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-nowrap">
            <ManagerFinancePaymentsFilters />
          </div>
        ) : null}
        <div className={oliveSegmentedHugTrackClass("max-sm:self-center sm:ml-auto")}>
          <span className={oliveSegmentedHugSegmentClassName(true)}>
            <OliveSegmentedActiveThumb layoutId={TODAY_PILL_LAYOUT_ID} />
            <span className="relative z-10">{t("dateCaption", { date: dateLabel })}</span>
          </span>
        </div>
      </div>
    </WorkspaceStickyPageHeader>
  );
}
