import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required for reports."
          : `Could not load reports (${res.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Reports & analytics"
      description={
        <>
          High-level KPIs match the dashboard API. CSV export for bookings is
          available to admins via{" "}
          <code className={adminChrome.inlineCode}>
            GET /v1/reports/bookings.csv?from=&amp;to=
          </code>
          .
        </>
      }
    >
      <AdminReportsSummary data={res.data} />
    </AccountPageFrame>
  );
}
