import { CoachUpcomingSessionsSection } from "@/components/coach/coach-upcoming-sessions-section";
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
        <h1 className="text-2xl font-semibold text-indigo-950">My schedule</h1>
        <p className="mt-2 text-sm text-indigo-900/80">
          Upcoming sessions assigned to you in the current planning window.
        </p>
      </div>
      <section>
        <h2 className="text-lg font-medium text-indigo-950">Sessions</h2>
        <CoachUpcomingSessionsSection
          locale={locale}
          sessions={panel.sessions}
        />
      </section>
    </div>
  );
}
