"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { AdminAnalyticsExportLinks } from "@/components/admin/admin-analytics-export-links";
import { AdminAnalyticsHeroFilters } from "@/components/admin/admin-analytics-hero-filters";
import {
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import { resolveAnalyticsSectionFromPathname, type AnalyticsWorkspace } from "@/components/admin/admin-analytics-module";
import type { AnalyticsFilterOptions } from "@/components/admin/admin-analytics-server-helpers";
import { AdminAnalyticsTabNav } from "@/components/admin/admin-analytics-tab-nav";
import { parseAnalyticsFiltersFromSearch } from "@/components/admin/admin-analytics-url";
import { useAdminPageHeaderSticky, useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";

type AdminAnalyticsUnifiedHeaderProps = {
  filterOptions: AnalyticsFilterOptions;
  workspace?: AnalyticsWorkspace;
};

function searchParamsToRecord(
  params: ReturnType<typeof useSearchParams>,
): Record<string, string | string[] | undefined> {
  return Object.fromEntries(params.entries());
}

function AdminAnalyticsUnifiedHeaderInner({
  filterOptions,
  workspace = "admin",
}: AdminAnalyticsUnifiedHeaderProps) {
  const t = useTranslations("adminPages.analytics");
  const stickyEnabled = useAdminPageHeaderSticky(true);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = resolveAnalyticsSectionFromPathname(pathname, workspace);
  const search = useMemo(() => searchParamsToRecord(searchParams), [searchParams]);
  const initialValues = useMemo(() => parseAnalyticsFiltersFromSearch(search), [search]);
  const { fromIso, toIso } = useMemo(() => {
    const rangeDays = parseAnalyticsRangeDays(searchParams.get("rangeDays") ?? undefined);
    const quickFilters = parseAnalyticsQuickFilters(searchParams.get("quick") ?? undefined);
    return resolveAnalyticsDateRange({ rangeDays, quickFilters });
  }, [searchParams]);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 overflow-visible max-sm:justify-center sm:justify-start">
        <h1 className="ommm-admin-header-title shrink-0">{t("title")}</h1>
        <AdminAnalyticsTabNav workspace={workspace} />
        {section ? (
          <div className="flex min-w-0 w-full items-center gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AdminAnalyticsHeroFilters
              key={section}
              section={section}
              filterOptions={filterOptions}
              initialValues={initialValues}
              trailing={
                workspace === "admin" ? (
                  <AdminAnalyticsExportLinks fromIso={fromIso} toIso={toIso} />
                ) : (
                  <AdminAnalyticsExportLinks
                    fromIso={fromIso}
                    toIso={toIso}
                    includeFinance={false}
                  />
                )
              }
            />
          </div>
        ) : null}
      </div>
    </WorkspaceStickyPageHeader>
  );
}

function AdminAnalyticsUnifiedHeaderFallback({
  workspace = "admin",
}: {
  workspace?: AnalyticsWorkspace;
}) {
  const t = useTranslations("adminPages.analytics");
  const stickyEnabled = useAdminPageHeaderSticky(true);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 max-sm:justify-center sm:justify-start">
        <h1 className="ommm-admin-header-title shrink-0">{t("title")}</h1>
        <AdminAnalyticsTabNav workspace={workspace} />
      </div>
    </WorkspaceStickyPageHeader>
  );
}

export function AdminAnalyticsUnifiedHeader({
  filterOptions,
  workspace = "admin",
}: AdminAnalyticsUnifiedHeaderProps) {
  return (
    <Suspense fallback={<AdminAnalyticsUnifiedHeaderFallback workspace={workspace} />}>
      <AdminAnalyticsUnifiedHeaderInner filterOptions={filterOptions} workspace={workspace} />
    </Suspense>
  );
}
