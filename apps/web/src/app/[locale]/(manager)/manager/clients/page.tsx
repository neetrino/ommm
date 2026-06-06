import { headers } from "next/headers";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { formatDateForUi } from "@/lib/date-display";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.clients" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.clients" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const res = await serverApiJson<AdminClientsPayload>(
    `/clients?meta=true&take=${listPage.take}&offset=${listPage.offset}`,
    cookie,
  );

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  const rows = res.data.rows;

  return (
    <AdminContentFrame>
      <AdminSectionShell banner={tManager("readOnlyHint")}>
        <ManagerStaffTableShell>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colName")}</th>
                <th className={adminChrome.th}>{t("colEmail")}</th>
                <th className={adminChrome.th}>{t("colRole")}</th>
                <th className={adminChrome.th}>{t("colJoined")}</th>
              </tr>
            </thead>
            <tbody className={adminChrome.tableBodyDividers}>
              {rows.map((client) => (
                <tr key={client.id}>
                  <td className={adminChrome.tdStrong}>
                    {[client.name, client.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className={adminChrome.td}>{client.email}</td>
                  <td className={adminChrome.tdMuted}>{tManager("roleClient")}</td>
                  <td className={adminChrome.tdMuted}>
                    {formatDateForUi(client.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagerStaffTableShell>
      </AdminSectionShell>
      <div className="mt-4">
        <Suspense fallback={null}>
          <ManagerListPagination
            total={res.data.pagination.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={listPage.offset}
          />
        </Suspense>
      </div>
    </AdminContentFrame>
  );
}
