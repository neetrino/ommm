import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { StaffScheduleSessionsList } from "@/components/shared/schedule/staff-schedule-sessions-list";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import {
  mapPublicSessionToScheduleListRow,
  type PublicClassSessionRow,
} from "@/lib/map-public-session-to-list-row";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tClients = await getTranslations({ locale, namespace: "adminPages.clients" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.classes" });
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const sessionsRes = await serverApiJson<PublicClassSessionRow[]>(
    `/classes/sessions?${q}`,
    cookie,
  );

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
        <StaffScheduleSessionsList
          locale={locale}
          sessions={sessions}
          emptyMessage={tManager("sessionsEmpty")}
          preset="staffWithCoach"
        />
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
