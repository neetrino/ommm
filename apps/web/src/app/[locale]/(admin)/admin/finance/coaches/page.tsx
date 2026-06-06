import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminFinanceCoachesFilters } from "@/components/admin/admin-finance-coaches-filters";
import { AdminFinanceCoachesPanel } from "@/components/admin/admin-finance-coaches-panel";
import type { CoachFinancePayload } from "@/components/admin/admin-finance-types";
import { normalizeFinanceSearch, redirectIfUnscopedFinanceSearchParams } from "@/components/admin/admin-finance-server-helpers";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import {
  FINANCE_COACH_PAGE_KEYS,
  buildFinanceCoachSalaryQuery,
  parseFinanceCoachesFiltersFromSearch,
} from "@/components/admin/admin-finance-url";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminFinanceCoachesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  redirectIfUnscopedFinanceSearchParams(locale, "coaches", search);
  const normalizedSearch = normalizeFinanceSearch(search);
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const coachFilters = parseFinanceCoachesFiltersFromSearch(search);
  const coachListPage = parseListPageParams(normalizedSearch, FINANCE_COACH_PAGE_KEYS);

  const coachFinanceRes = await serverApiJson<CoachFinancePayload>(
    buildFinanceCoachSalaryQuery(coachFilters, coachListPage),
    cookie,
  );

  if (!coachFinanceRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {coachFinanceRes.status === 401 || coachFinanceRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: coachFinanceRes.status })}
      </div>
    );
  }

  return (
    <AdminSectionShell>
      <Suspense fallback={null}>
        <AdminFinanceCoachesFilters
          key={`${coachFilters.q}|${coachFilters.month}|${coachFilters.payoutStatus}|${coachFilters.order}|${coachFilters.quick}`}
          initialValues={coachFilters}
        />
      </Suspense>
      <AdminFinanceCoachesPanel
        locale={locale}
        initial={coachFinanceRes.data}
        filters={coachFilters}
      />
    </AdminSectionShell>
  );
}
