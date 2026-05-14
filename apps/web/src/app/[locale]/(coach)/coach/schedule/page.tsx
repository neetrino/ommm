import { CoachUpcomingSessionsSection } from "@/components/coach/coach-upcoming-sessions-section";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

export default async function CoachSchedulePage({
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

  return (
    <AccountPageFrame
      title="My schedule"
      description="Upcoming sessions assigned to you in the current planning window."
    >
      <section className={adminChrome.panel}>
        <h2 className={adminChrome.panelHeading}>Sessions</h2>
        <CoachUpcomingSessionsSection locale={locale} sessions={panel.sessions} />
      </section>
    </AccountPageFrame>
  );
}
