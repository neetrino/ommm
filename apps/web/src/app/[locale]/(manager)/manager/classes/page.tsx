import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { StaffScheduleSessionsList } from "@/components/shared/schedule/staff-schedule-sessions-list";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import {
  mapPublicSessionToScheduleListRow,
  type PublicClassSessionRow,
} from "@/lib/map-public-session-to-list-row";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
  slug: string;
};

export default async function ManagerClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tSchedule = await getTranslations({ locale, namespace: "adminPages.schedule" });
  const tClients = await getTranslations({ locale, namespace: "adminPages.clients" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.classes" });
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const [typesRes, sessionsRes] = await Promise.all([
    serverApiJson<ClassTypeRow[]>("/classes/types", cookie),
    serverApiJson<PublicClassSessionRow[]>(`/classes/sessions?${q}`, cookie),
  ]);

  if (!typesRes.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {typesRes.status === 401 || typesRes.status === 403
            ? tClients("errorAuth")
            : tManager("loadClassTypesFailed", { status: typesRes.status })}
        </div>
      </AdminContentFrame>
    );
  }

  if (!sessionsRes.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {sessionsRes.status === 401 || sessionsRes.status === 403
            ? tClients("errorAuth")
            : tManager("loadSessionsFailed", { status: sessionsRes.status })}
        </div>
      </AdminContentFrame>
    );
  }

  const sessions = sessionsRes.data.map(mapPublicSessionToScheduleListRow);

  return (
    <AdminContentFrame>
      <AdminSectionShell
        banner={tManager("scheduleWindowHint", {
          days: ACCOUNT_SESSION_RANGE_DAYS,
        })}
      >
        <div>
          <h2 className={adminChrome.sectionTitle}>{tManager("classTypesTitle")}</h2>
          <ManagerStaffTableShell>
            <table className={`${adminChrome.table} mt-4`}>
              <thead className={adminChrome.thead}>
                <tr>
                  <th className={adminChrome.th}>{tSchedule("colClassName")}</th>
                  <th className={adminChrome.th}>{tManager("colSlug")}</th>
                </tr>
              </thead>
              <tbody className={adminChrome.tableBodyDividers}>
                {typesRes.data.map((row) => (
                  <tr key={row.id}>
                    <td className={adminChrome.tdStrong}>{row.name}</td>
                    <td className={adminChrome.tdMuted}>{row.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ManagerStaffTableShell>
        </div>

        <div className="mt-8">
          <h2 className={adminChrome.sectionTitle}>{tManager("sessionsTitle")}</h2>
          <div className="mt-4">
            <StaffScheduleSessionsList
              locale={locale}
              sessions={sessions}
              emptyMessage={tManager("sessionsEmpty")}
              preset="staffWithCoach"
            />
          </div>
        </div>
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
