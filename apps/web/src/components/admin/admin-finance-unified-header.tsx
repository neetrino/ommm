"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
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
  params: ReadonlyURLSearchParams,
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
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar overflow-visible flex min-h-[3.25rem] flex-nowrap items-center gap-2 py-2 sm:gap-3">
        <h1 className="ommm-admin-header-title shrink-0 text-xl sm:text-2xl">{t("title")}</h1>
        <AdminFinanceTabNav />
        {section ? (
          <AdminFinanceTabFilters section={section} search={search} />
        ) : null}
      </div>
    </header>
  );
}

function AdminFinanceUnifiedHeaderFallback() {
  const t = useTranslations("adminPages.finance");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar flex min-h-[3.25rem] flex-nowrap items-center gap-2 py-2 sm:gap-3">
        <h1 className="ommm-admin-header-title shrink-0 text-xl sm:text-2xl">{t("title")}</h1>
        <AdminFinanceTabNav />
      </div>
    </header>
  );
}

/** Finance module header — title, tabs, search, and export on one line. */
export function AdminFinanceUnifiedHeader() {
  return (
    <Suspense fallback={<AdminFinanceUnifiedHeaderFallback />}>
      <AdminFinanceUnifiedHeaderInner />
    </Suspense>
  );
}
