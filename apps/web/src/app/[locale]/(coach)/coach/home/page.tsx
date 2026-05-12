import { Link } from "@/i18n/navigation";
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

  const { sessions, roster, userName } = panel;
  const today = new Date();
  const todaysSessions = sessions.filter((s) =>
    isSameLocalCalendarDay(s.startsAt, today),
  );
  const todaysRoster = roster.filter((b) =>
    isSameLocalCalendarDay(b.session.startsAt, today),
  );

  const linkClass =
    "inline-flex rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-950 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-indigo-950">
          Hi{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-2 text-sm text-indigo-900/80">
          Quick overview of today and your upcoming teaching load.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-indigo-950">Today at a glance</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-indigo-100 bg-white p-4 shadow-sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Classes today
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {todaysSessions.length}
            </dd>
          </div>
          <div className="rounded-[24px] border border-indigo-100 bg-white p-4 shadow-sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Booked clients today
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {todaysRoster.length}
            </dd>
          </div>
          <div className="rounded-[24px] border border-indigo-100 bg-white p-4 shadow-sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Upcoming sessions (range)
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {sessions.length}
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/coach/schedule" className={linkClass}>
          Open my schedule
        </Link>
        <Link href="/coach/groups" className={linkClass}>
          View participants & attendance
        </Link>
      </section>
    </div>
  );
}
