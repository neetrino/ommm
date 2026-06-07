"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";
import { AdminFinanceCoachesFilters } from "@/components/admin/admin-finance-coaches-filters";
import { AdminFinanceMembersFilters } from "@/components/admin/admin-finance-members-filters";
import { AdminFinanceOverviewFilters } from "@/components/admin/admin-finance-overview-filters";
import { AdminFinancePaymentsFilters } from "@/components/admin/admin-finance-payments-filters";
import { AdminFinanceTabNav } from "@/components/admin/admin-finance-tab-nav";
import {
  resolveFinanceSectionFromPathname,
  type FinanceSectionId,
} from "@/components/admin/admin-finance-module";
import {
  parseFinanceCoachesFiltersFromSearch,
  parseFinanceMembersFiltersFromSearch,
  parseFinanceOverviewFiltersFromSearch,
  parseFinancePaymentsFiltersFromSearch,
} from "@/components/admin/admin-finance-url";

function searchParamsToRecord(
  params: ReturnType<typeof useSearchParams>,
): Record<string, string | string[] | undefined> {
  return Object.fromEntries(params.entries());
}

type AdminFinanceTabFiltersProps = {
  section: FinanceSectionId;
  search: Record<string, string | string[] | undefined>;
};

function AdminFinanceTabFilters({ section, search }: AdminFinanceTabFiltersProps) {
  switch (section) {
    case "overview": {
      const { rangeDays } = parseFinanceOverviewFiltersFromSearch(search);
      return <AdminFinanceOverviewFilters initialRangeDays={rangeDays} />;
    }
    case "payments": {
      const initialValues = parseFinancePaymentsFiltersFromSearch(search);
      return (
        <AdminFinancePaymentsFilters
          key={`${initialValues.q}|${initialValues.rangeDays}|${initialValues.source}|${initialValues.status}`}
          initialValues={initialValues}
        />
      );
    }
    case "members": {
      const initialValues = parseFinanceMembersFiltersFromSearch(search);
      return (
        <AdminFinanceMembersFilters
          key={`${initialValues.q}|${initialValues.paymentStatus}|${initialValues.order}|${initialValues.giftCardOnly}|${initialValues.quick}`}
          initialValues={initialValues}
        />
      );
    }
    case "coaches": {
      const initialValues = parseFinanceCoachesFiltersFromSearch(search);
      return (
        <AdminFinanceCoachesFilters
          key={`${initialValues.q}|${initialValues.month}|${initialValues.payoutStatus}|${initialValues.order}|${initialValues.quick}`}
          initialValues={initialValues}
        />
      );
    }
  }
}

function AdminFinanceUnifiedHeaderInner() {
  const t = useTranslations("adminPages.finance");
  const headerRef = useAdminStickyHeaderOffset(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = resolveFinanceSectionFromPathname(pathname);
  const search = useMemo(
    () => searchParamsToRecord(searchParams),
    [searchParams],
  );

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module">
      <div className="ommm-admin-header-bar overflow-visible flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminFinanceTabNav />
        </div>
        {section ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-nowrap">
            <AdminFinanceTabFilters section={section} search={search} />
          </div>
        ) : null}
      </div>
    </WorkspaceStickyPageHeader>
  );
}

function AdminFinanceUnifiedHeaderFallback() {
  const t = useTranslations("adminPages.finance");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="module">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <h1 className="ommm-admin-header-title">{t("title")}</h1>
          <AdminFinanceTabNav />
        </div>
      </div>
    </WorkspaceStickyPageHeader>
  );
}

/** Finance module header — AdminPageHero layout with section pill tabs. */
export function AdminFinanceUnifiedHeader() {
  return (
    <Suspense fallback={<AdminFinanceUnifiedHeaderFallback />}>
      <AdminFinanceUnifiedHeaderInner />
    </Suspense>
  );
}
