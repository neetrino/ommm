import { adminChrome } from "@/components/admin/admin-chrome";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

type AdminReportsSummaryProps = {
  data: Dashboard;
};

export function AdminReportsSummary({ data }: AdminReportsSummaryProps) {
  return (
    <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>Sessions today</p>
        <p className={adminChrome.metricValue}>{data.sessionsToday}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>Bookings today</p>
        <p className={adminChrome.metricValue}>{data.bookingsToday}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>Active waitlists</p>
        <p className={adminChrome.metricValue}>{data.activeWaitlists}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>Active members</p>
        <p className={adminChrome.metricValue}>{data.activeMembers}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>Revenue (cents recorded)</p>
        <p className={adminChrome.metricValue}>{data.revenueCentsTotal}</p>
      </li>
    </ul>
  );
}
