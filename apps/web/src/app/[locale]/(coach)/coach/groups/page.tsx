import { CoachAttendanceRosterSection } from "@/components/coach/coach-attendance-roster-section";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

export default async function CoachGroupsPage({
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
      title="My groups"
      description="Booked participants for your sessions - mark attendance when class wraps."
    >
      <section className={adminChrome.panel}>
        <h2 className={adminChrome.panelHeading}>Attendance (booked)</h2>
        <p className={adminChrome.metaText}>
          This view reflects your assigned sessions only and keeps waitlist + roster
          visibility scoped by coach.
        </p>
        <CoachAttendanceRosterSection locale={locale} roster={panel.roster} />
      </section>
    </AccountPageFrame>
  );
}
