import { CoachAttendanceRosterSection } from "@/components/coach/coach-attendance-roster-section";
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Sign in to open the coach panel.
        </div>
      );
    }
    if (panel.reason === "not_coach_role" && panel.role) {
      redirectToRoleHome(locale, panel.role);
    }
    return (
      <div className="rounded-[24px] border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
        This area is for studio coaches. Your account does not have a coach
        profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-indigo-950">My groups</h1>
        <p className="mt-2 text-sm text-indigo-900/80">
          Booked participants for your sessions — mark attendance when class
          wraps.
        </p>
      </div>
      <section>
        <h2 className="text-lg font-medium text-indigo-950">
          Attendance (booked)
        </h2>
        <CoachAttendanceRosterSection
          locale={locale}
          roster={panel.roster}
        />
      </section>
    </div>
  );
}
