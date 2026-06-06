"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDateForUi } from "@/lib/date-display";
import { AdminAnalyticsExportLinks } from "@/components/admin/admin-analytics-export-links";
import { AdminAnalyticsFilters } from "@/components/admin/admin-analytics-filters";
import {
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import type { AnalyticsFilterOptions } from "@/components/admin/admin-analytics-server-helpers";
import { AdminAnalyticsTabNav } from "@/components/admin/admin-analytics-tab-nav";
import { AdminAnalyticsViewSwitcher } from "@/components/admin/admin-analytics-view-switcher";
import { resolveAnalyticsSectionFromPathname } from "@/components/admin/admin-analytics-module";
import type { AnalyticsViewMode } from "@/components/admin/admin-analytics-types";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";

type AdminAnalyticsUnifiedHeaderProps = {
  filterOptions: AnalyticsFilterOptions;
};

function AdminAnalyticsUnifiedHeaderInner({ filterOptions }: AdminAnalyticsUnifiedHeaderProps) {
  const t = useTranslations("adminPages.analytics");
  const headerRef = useAdminStickyHeaderOffset(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = resolveAnalyticsSectionFromPathname(pathname);
  const viewMode = (searchParams.get("view") === "chart" ? "chart" : "table") as AnalyticsViewMode;
  const { fromIso, toIso } = useMemo(() => {
    const rangeDays = parseAnalyticsRangeDays(searchParams.get("rangeDays") ?? undefined);
    const quickFilters = parseAnalyticsQuickFilters(searchParams.get("quick") ?? undefined);
    return resolveAnalyticsDateRange({ rangeDays, quickFilters });
  }, [searchParams]);

  function setView(mode: AnalyticsViewMode): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar overflow-visible flex-col items-stretch gap-3">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminAnalyticsTabNav />
        </div>
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <AdminAnalyticsFilters
            compact
            section={section}
            filterOptions={filterOptions}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:pt-1">
            <AdminAnalyticsViewSwitcher value={viewMode} onChange={setView} />
            <AdminAnalyticsExportLinks
              fromIso={fromIso}
              toIso={toIso}
              paymentsLabel={t("export.paymentsCsv")}
              bookingsLabel={t("export.bookingsCsv")}
              giftCreditsLabel={t("export.giftCreditsCsv")}
            />
            <p className="w-full text-xs text-sage-500 xl:w-auto">
              {t("rangeHint", {
                from: formatDateForUi(fromIso),
                to: formatDateForUi(toIso),
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminAnalyticsUnifiedHeaderFallback() {
  const t = useTranslations("adminPages.analytics");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminAnalyticsTabNav />
        </div>
      </div>
    </header>
  );
}

export function AdminAnalyticsUnifiedHeader(props: AdminAnalyticsUnifiedHeaderProps) {
  return (
    <Suspense fallback={<AdminAnalyticsUnifiedHeaderFallback />}>
      <AdminAnalyticsUnifiedHeaderInner {...props} />
    </Suspense>
  );
}
