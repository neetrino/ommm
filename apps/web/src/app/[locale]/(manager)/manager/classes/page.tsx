import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { ManagerStaffTableShell } from "@/components/manager/manager-staff-table-shell";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { formatDateTimeForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
  slug: string;
};

type SessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

export default async function ManagerClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tBookings = await getTranslations({ locale, namespace: "adminPages.bookings" });
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
    serverApiJson<SessionRow[]>(`/classes/sessions?${q}`, cookie),
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
          <ManagerStaffTableShell>
            <table className={`${adminChrome.table} mt-4`}>
              <thead className={adminChrome.thead}>
                <tr>
                  <th className={adminChrome.th}>{tSchedule("colClassName")}</th>
                  <th className={adminChrome.th}>{tBookings("colStarts")}</th>
                  <th className={adminChrome.th}>{tManager("colCoach")}</th>
                  <th className={adminChrome.th}>{tManager("colBooked")}</th>
                  <th className={adminChrome.th}>{tSchedule("colStatus")}</th>
                </tr>
              </thead>
              <tbody className={adminChrome.tableBodyDividers}>
                {sessionsRes.data.map((session) => (
                  <tr key={session.id}>
                    <td className={adminChrome.tdStrong}>{session.classType.name}</td>
                    <td className={adminChrome.td}>
                      {formatDateTimeForUi(session.startsAt, locale)}
                    </td>
                    <td className={adminChrome.tdMuted}>
                      {session.coach.user.name ?? "—"}
                    </td>
                    <td className={adminChrome.tdMuted}>
                      {session._count.bookings}/{session.capacity}
                    </td>
                    <td className={adminChrome.tdMuted}>{session.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ManagerStaffTableShell>
        </div>
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
