import { headers } from "next/headers";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AdminWaitlistActions } from "@/components/admin/admin-waitlist-actions";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { formatDateTimeForUi } from "@/lib/date-display";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type WaitlistAdminRow = {
  id: string;
  position: number;
  status: string;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  session: { id: string; startsAt: string; classType: { name: string } };
};

type ManagerWaitlistsPayload = {
  items: WaitlistAdminRow[];
  total: number;
  take: number;
  offset: number;
};

export default async function ManagerWaitlistsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.waitlists" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.waitlists" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const res = await serverApiJson<ManagerWaitlistsPayload>(
    `/waitlist/admin/active?take=${listPage.take}&offset=${listPage.offset}`,
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

  return (
    <AdminContentFrame>
      <AdminSectionShell banner={tManager("operationalHint")}>
        <ManagerStaffTableShell>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colUser")}</th>
                <th className={adminChrome.th}>{t("colClassType")}</th>
                <th className={adminChrome.th}>{tManager("colSession")}</th>
                <th className={adminChrome.th}>{tManager("colPos")}</th>
                <th className={adminChrome.th}>{tManager("colStatus")}</th>
                <th className={adminChrome.th}>{tManager("colOfferExpires")}</th>
                <th className={adminChrome.th}>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className={adminChrome.tableBodyDividers}>
              {res.data.items.map((entry) => (
                <tr key={entry.id}>
                  <td className={adminChrome.td}>
                    <div className="font-medium text-sage-900">
                      {entry.user.name ?? "—"}
                    </div>
                    <div className={adminChrome.metaText}>{entry.user.email}</div>
                  </td>
                  <td className={adminChrome.td}>{entry.session.classType.name}</td>
                  <td className={adminChrome.tdMuted}>
                    {formatDateTimeForUi(entry.session.startsAt, locale)}
                  </td>
                  <td className={adminChrome.tdMuted}>{entry.position}</td>
                  <td className={adminChrome.tdMuted}>{entry.status}</td>
                  <td className={adminChrome.tdMuted}>
                    {entry.offerExpiresAt
                      ? formatDateTimeForUi(entry.offerExpiresAt, locale)
                      : "—"}
                  </td>
                  <td className={adminChrome.td}>
                    <AdminWaitlistActions
                      entryId={entry.id}
                      sessionId={entry.session.id}
                      locale={locale}
                    />
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
            total={res.data.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={listPage.offset}
          />
        </Suspense>
      </div>
    </AdminContentFrame>
  );
}
