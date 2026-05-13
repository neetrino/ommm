import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal?: number;
};

type AdminReportsSummaryProps = {
  data: Dashboard;
  locale: string;
};

export async function AdminReportsSummary({ data, locale }: AdminReportsSummaryProps) {
  const tm = await getTranslations({ locale, namespace: "adminHome.metrics" });

  return (
    <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>{tm("sessionsToday")}</p>
        <p className={adminChrome.metricValue}>{data.sessionsToday}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>{tm("bookingsToday")}</p>
        <p className={adminChrome.metricValue}>{data.bookingsToday}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>{tm("activeWaitlists")}</p>
        <p className={adminChrome.metricValue}>{data.activeWaitlists}</p>
      </li>
      <li className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>{tm("activeMembers")}</p>
        <p className={adminChrome.metricValue}>{data.activeMembers}</p>
      </li>
      {typeof data.revenueCentsTotal === "number" ? (
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{tm("revenueCents")}</p>
          <p className={adminChrome.metricValue}>{data.revenueCentsTotal}</p>
        </li>
      ) : null}
    </ul>
  );
}
