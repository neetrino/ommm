import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type PanelSummary = {
  coachProfileId: string;
  todaySessions: number;
  bookedToday: number;
  activeWaitlistsForCoachSessions: number;
};

export default async function CoachAnalyticsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<PanelSummary | null>(
    "/coaches/panel/summary",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Coach sign-in required."
          : "Could not load coach analytics."}
      </div>
    );
  }

  if (res.data === null) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No coach profile is linked to this account.
      </div>
    );
  }

  const d = res.data;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-indigo-950">Analytics</h1>
      <p className="mt-2 text-sm text-indigo-900/80">
        Snapshot from the coach panel API. Charts can extend this dataset later.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            Today&apos;s sessions
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {d.todaySessions}
          </p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            Bookings today
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {d.bookedToday}
          </p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            Active waitlists
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {d.activeWaitlistsForCoachSessions}
          </p>
        </li>
      </ul>
    </div>
  );
}
