import { headers } from "next/headers";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerListPagination } from "@/components/manager/manager-list-pagination";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  bio: string | null;
  specialization: string | null;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

type ManagerCoachesPayload = {
  items: CoachAdminRow[];
  total: number;
  take: number;
  offset: number;
};

function coachDisplayName(user: CoachAdminRow["user"]): string {
  const value = [user.name, user.lastName].filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : "—";
}

export default async function ManagerCoachesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.coaches" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.coaches" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const res = await serverApiJson<ManagerCoachesPayload>(
    `/coaches/admin/list?take=${listPage.take}&offset=${listPage.offset}`,
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
      <AdminSectionShell banner={tManager("readOnlyHint")}>
        <ManagerStaffTableShell>
          <table className={`${adminChrome.table} min-w-[34rem] table-fixed`}>
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[30%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colName")}</th>
                <th className={adminChrome.th}>{t("colEmail")}</th>
                <th className={`${adminChrome.th} text-center`}>{tManager("colPhone")}</th>
                <th className={`${adminChrome.th} text-center`}>
                  {tManager("colSpecialization")}
                </th>
              </tr>
            </thead>
            <tbody className={adminChrome.tableBodyDividers}>
              {res.data.items.map((coach) => (
                <tr key={coach.id}>
                  <td className={adminChrome.tdStrong}>{coachDisplayName(coach.user)}</td>
                  <td className={adminChrome.td}>{coach.user.email}</td>
                  <td className={`${adminChrome.td} text-center`}>
                    {coach.user.phone ?? "—"}
                  </td>
                  <td className={`${adminChrome.tdMuted} text-center`}>
                    {coach.specialization ?? "—"}
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
