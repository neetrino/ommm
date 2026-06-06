import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { AdminFinanceMembersPanel } from "@/components/admin/admin-finance-members-panel";
import { normalizeFinanceSearch, redirectIfUnscopedFinanceSearchParams } from "@/components/admin/admin-finance-server-helpers";
import {
  FINANCE_USER_PAGE_KEYS,
  buildFinanceMembersClientsQuery,
  parseFinanceMembersFiltersFromSearch,
} from "@/components/admin/admin-finance-url";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminFinanceMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  redirectIfUnscopedFinanceSearchParams(locale, "members", search);
  const normalizedSearch = normalizeFinanceSearch(search);
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const memberFilters = parseFinanceMembersFiltersFromSearch(search);
  const userListPage = parseListPageParams(normalizedSearch, FINANCE_USER_PAGE_KEYS);

  const clientsRes = await serverApiJson<AdminClientsPayload>(
    buildFinanceMembersClientsQuery(memberFilters, userListPage),
    cookie,
  );

  if (!clientsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {clientsRes.status === 401 || clientsRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: clientsRes.status })}
      </div>
    );
  }

  return (
    <AdminFinanceMembersPanel
      locale={locale}
      initialClients={clientsRes.data}
      filters={memberFilters}
    />
  );
}
