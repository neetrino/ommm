import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { serverApiJson } from "@/lib/server-api";
import { getSessionAuth } from "@/server/require-role-layout";

type DashboardSummary = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
};

export default async function ManagerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tHome = await getTranslations({ locale, namespace: "managerPages.home" });
  const tMetrics = await getTranslations({ locale, namespace: "adminHome.overview.cards" });
  const session = await getSessionAuth();

  if (!session.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          <p>{tHome("signInRequired")}</p>
          <Link href="/login" className="ommm-cta-primary mt-4 inline-flex text-sm">
            {tCommon("login")}
          </Link>
        </div>
      </AdminContentFrame>
    );
  }

  const dashboardRes = await serverApiJson<DashboardSummary>(
    "/reports/dashboard",
    session.cookie,
  );

  const name = session.user.name?.trim();
  const greeting =
    name !== undefined && name.length > 0
      ? tHome("greeting", { name: `, ${name}` })
      : tHome("greeting", { name: "" });

  return (
    <AdminContentFrame>
      <p className={`${adminChrome.ledeTight} mb-6`}>{greeting}</p>
      <AdminSectionShell>
        <p className={adminChrome.panelHeading}>{tHome("nextStepsTitle")}</p>
        <p className={`mt-2 ${adminChrome.metaText}`}>{tHome("nextStepsBody")}</p>
      </AdminSectionShell>
      {dashboardRes.ok ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className={adminChrome.metricCard}>
            <p className={adminChrome.metricLabel}>{tMetrics("todayClasses.title")}</p>
            <p className={adminChrome.metricValue}>{dashboardRes.data.sessionsToday}</p>
          </li>
          <li className={adminChrome.metricCard}>
            <p className={adminChrome.metricLabel}>{tMetrics("todayBookings.title")}</p>
            <p className={adminChrome.metricValue}>{dashboardRes.data.bookingsToday}</p>
          </li>
          <li className={adminChrome.metricCard}>
            <p className={adminChrome.metricLabel}>{tMetrics("waitlistCount.title")}</p>
            <p className={adminChrome.metricValue}>{dashboardRes.data.activeWaitlists}</p>
          </li>
          <li className={adminChrome.metricCard}>
            <p className={adminChrome.metricLabel}>{tMetrics("activeMembers.title")}</p>
            <p className={adminChrome.metricValue}>{dashboardRes.data.activeMembers}</p>
          </li>
        </ul>
      ) : null}
    </AdminContentFrame>
  );
}
