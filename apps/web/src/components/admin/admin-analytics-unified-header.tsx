"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminAnalyticsExportLinks } from "@/components/admin/admin-analytics-export-links";
import { AdminAnalyticsHeroFilters } from "@/components/admin/admin-analytics-hero-filters";
import {
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import { resolveAnalyticsSectionFromPathname } from "@/components/admin/admin-analytics-module";
import type { AnalyticsFilterOptions } from "@/components/admin/admin-analytics-server-helpers";
import { AdminAnalyticsTabNav } from "@/components/admin/admin-analytics-tab-nav";
import { AdminAnalyticsViewSwitcher } from "@/components/admin/admin-analytics-view-switcher";
import type { AnalyticsViewMode } from "@/components/admin/admin-analytics-types";
import { parseAnalyticsFiltersFromSearch } from "@/components/admin/admin-analytics-url";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";

type AdminAnalyticsUnifiedHeaderProps = {
  filterOptions: AnalyticsFilterOptions;
};

function searchParamsToRecord(
  params: ReturnType<typeof useSearchParams>,
): Record<string, string | string[] | undefined> {
  return Object.fromEntries(params.entries());
}

function AdminAnalyticsUnifiedHeaderInner({ filterOptions }: AdminAnalyticsUnifiedHeaderProps) {
  const t = useTranslations("adminPages.analytics");
  const headerRef = useAdminStickyHeaderOffset(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = resolveAnalyticsSectionFromPathname(pathname);
  const search = useMemo(() => searchParamsToRecord(searchParams), [searchParams]);
  const initialValues = useMemo(() => parseAnalyticsFiltersFromSearch(search), [search]);
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
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminAnalyticsTabNav />
        </div>
        {section ? (
          <div className="flex min-w-0 w-full items-center gap-2">
            <AdminAnalyticsHeroFilters
              key={section}
              section={section}
              filterOptions={filterOptions}
              initialValues={initialValues}
              trailing={
                <>
                  <AdminAnalyticsViewSwitcher compact value={viewMode} onChange={setView} />
                  <AdminAnalyticsExportLinks fromIso={fromIso} toIso={toIso} />
                </>
              }
            />
          </div>
        ) : null}
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
        <div className="flex min-w-0 flex-wrap items-center gap-3">
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
