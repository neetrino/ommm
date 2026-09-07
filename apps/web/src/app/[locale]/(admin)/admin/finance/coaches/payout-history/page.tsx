import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminFinanceCoachPayoutHistoryPanel } from "@/components/admin/admin-finance-coach-payout-history-panel";
import type { CoachSalaryPayoutHistoryPayload } from "@/components/admin/admin-finance-types";
import { normalizeFinanceSearch } from "@/components/admin/admin-finance-server-helpers";
import {
  FINANCE_COACH_PAYOUT_PAGE_KEYS,
  buildFinanceCoachPayoutHistoryApiQuery,
  parseFinanceCoachPayoutHistoryFiltersFromSearch,
} from "@/components/admin/admin-finance-url";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminFinanceCoachPayoutHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const normalizedSearch = normalizeFinanceSearch(search);
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const filters = parseFinanceCoachPayoutHistoryFiltersFromSearch(search);
  const listPage = parseListPageParams(normalizedSearch, FINANCE_COACH_PAYOUT_PAGE_KEYS);

  const payoutsRes = await serverApiJson<CoachSalaryPayoutHistoryPayload>(
    buildFinanceCoachPayoutHistoryApiQuery(filters, listPage),
    cookie,
  );

  if (!payoutsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {payoutsRes.status === 401 || payoutsRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: payoutsRes.status })}
      </div>
    );
  }

  return (
    <AdminFinanceCoachPayoutHistoryPanel
      locale={locale}
      initial={payoutsRes.data}
      filters={filters}
    />
  );
}
