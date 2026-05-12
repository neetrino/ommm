import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";
import { AdminReportsSummary } from "./admin-reports-summary";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

export default async function AdminReportsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<Dashboard>("/reports/dashboard", cookie);

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required for reports."
          : `Could not load reports (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        Reports &amp; analytics
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        High-level KPIs match the dashboard API. CSV export for bookings is
        available to admins via{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs">
          GET /v1/reports/bookings.csv?from=&amp;to=
        </code>
        .
      </p>
      <AdminReportsSummary data={res.data} />
    </div>
  );
}
