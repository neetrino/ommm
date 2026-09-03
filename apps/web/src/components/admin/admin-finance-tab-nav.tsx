"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  FINANCE_SECTION_HREF,
  FINANCE_SECTION_IDS,
  type FinanceSectionId,
} from "@/components/admin/admin-finance-module";
import { buildFinanceTabHref } from "@/components/admin/admin-finance-url";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";

const TAB_LABEL_KEY: Record<FinanceSectionId, string> = {
  overview: "overview",
  payments: "payments",
  coaches: "coaches",
};

const FINANCE_SWITCHER_COLUMN_COUNT = 3;

/** Overview / Payments / Coaches — olive segmented switcher. */
export function AdminFinanceTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("adminPages.finance.tabs");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );

  const activeIndex = Math.max(
    0,
    FINANCE_SECTION_IDS.findIndex((section) => {
      const basePath = FINANCE_SECTION_HREF[section];
      return pathname === basePath || pathname.endsWith(basePath);
    }),
  );

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={oliveSegmentedTrackClass(FINANCE_SWITCHER_COLUMN_COUNT, className)}
    >
      <span
        aria-hidden
        className={oliveSegmentedThumbClass(FINANCE_SWITCHER_COLUMN_COUNT, activeIndex)}
      />
      {FINANCE_SECTION_IDS.map((section) => {
        const basePath = FINANCE_SECTION_HREF[section];
        const href = buildFinanceTabHref(section, search);
        const active = pathname === basePath || pathname.endsWith(basePath);
        return (
          <Link
            key={section}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={oliveSegmentedSegmentClassName(active, FINANCE_SWITCHER_COLUMN_COUNT)}
          >
            {t(TAB_LABEL_KEY[section])}
          </Link>
        );
      })}
    </nav>
  );
}
