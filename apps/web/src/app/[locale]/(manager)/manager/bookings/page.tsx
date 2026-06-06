import { headers } from "next/headers";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AdminBookingActions } from "@/components/admin/admin-booking-actions";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { formatDateTimeForUi } from "@/lib/date-display";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type ManagerBookingRow = {
  id: string;
  recordType?: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    id: string;
    startsAt: string;
    classType: { name: string };
  };
};

type ManagerBookingsPayload = {
  rows: ManagerBookingRow[];
  pagination: { total: number; take: number; offset: number };
};

export default async function ManagerBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setDate(to.getDate() + 30);
  const q = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    take: String(listPage.take),
    offset: String(listPage.offset),
  });

  const res = await serverApiJson<ManagerBookingsPayload>(
    `/bookings/admin/management?${q.toString()}`,
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

  const rows = res.data.rows.filter((row) => row.recordType === "BOOKING");

  return (
    <AdminContentFrame>
      <AdminSectionShell banner={tManager("rollingWindowHint")}>
        <ManagerStaffTableShell>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colMember")}</th>
                <th className={adminChrome.th}>{t("colClass")}</th>
                <th className={adminChrome.th}>{t("colStarts")}</th>
                <th className={adminChrome.th}>{t("colStatus")}</th>
                <th className={adminChrome.th}>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className={adminChrome.tableBodyDividers}>
              {rows.map((booking) => (
                <tr key={booking.id}>
                  <td className={adminChrome.td}>
                    <span className="font-medium text-sage-900">
                      {booking.user.name ?? booking.user.email}
                    </span>
                    <br />
                    <span className={adminChrome.metaText}>{booking.user.email}</span>
                  </td>
                  <td className={adminChrome.td}>{booking.session.classType.name}</td>
                  <td className={adminChrome.tdMuted}>
                    {formatDateTimeForUi(booking.session.startsAt, locale)}
                  </td>
                  <td className={adminChrome.tdMuted}>{booking.status}</td>
                  <td className={adminChrome.td}>
                    <AdminBookingActions
                      bookingId={booking.id}
                      defaultSessionId={booking.session.id}
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
