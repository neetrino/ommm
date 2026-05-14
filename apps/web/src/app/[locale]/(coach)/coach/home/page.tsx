import { Link } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

function isSameLocalCalendarDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export default async function CoachHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const panel = await loadCoachPanelPageData();

  if (!panel.ok) {
    if (panel.reason === "not_signed_in") {
      return (
        <div className="app-alert-warn max-w-xl">
          Sign in to open the coach panel.
        </div>
      );
    }
    if (panel.reason === "not_coach_role" && panel.role) {
      redirectToRoleHome(locale, panel.role);
    }
    return (
      <div className="app-alert-warn max-w-xl">
        This area is for studio coaches. Your account does not have a coach
        profile.
      </div>
    );
  }

  const { sessions, roster, userName } = panel;
  const today = new Date();
  const todaysSessions = sessions.filter((s) =>
    isSameLocalCalendarDay(s.startsAt, today),
  );
  const todaysRoster = roster.filter((b) =>
    isSameLocalCalendarDay(b.session.startsAt, today),
  );

  const linkClass =
    "ommm-cta-primary inline-flex text-sm";

  return (
    <AccountPageFrame
      title={`Hi${userName ? `, ${userName}` : ""}`}
      description="Quick overview of today and your upcoming teaching load."
    >
      <section>
        <h2 className={adminChrome.sectionTitle}>Today at a glance</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>Classes today</dt>
            <dd className={adminChrome.metricValue}>{todaysSessions.length}</dd>
          </div>
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>Booked clients today</dt>
            <dd className={adminChrome.metricValue}>{todaysRoster.length}</dd>
          </div>
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>Upcoming sessions (range)</dt>
            <dd className={adminChrome.metricValue}>{sessions.length}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link href="/coach/schedule" className={linkClass}>
          Open my schedule
        </Link>
        <Link href="/coach/groups" className={linkClass}>
          View participants & attendance
        </Link>
      </section>
    </AccountPageFrame>
  );
}
