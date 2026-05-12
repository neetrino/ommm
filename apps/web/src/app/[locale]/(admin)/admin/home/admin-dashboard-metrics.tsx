import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

export async function AdminDashboardMetrics({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "adminHome" });
  const tm = await getTranslations({ locale, namespace: "adminHome.metrics" });
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let data: Dashboard | null = null;
  let err: string | null = null;
  try {
    const res = await fetch(`${origin}/api/v1/reports/dashboard`, {
      cache: "no-store",
      headers: { cookie },
    });
    if (res.ok) {
      data = (await res.json()) as Dashboard;
    } else {
      err = await res.text();
    }
  } catch {
    err = t("fetchError");
  }

  return (
    <AccountPageFrame title={t("pageTitle")}>
      {err ? (
        <p className="text-sm text-amber-900">{err}</p>
      ) : data ? (
        <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label={tm("sessionsToday")} value={data.sessionsToday} />
          <Metric label={tm("bookingsToday")} value={data.bookingsToday} />
          <Metric label={tm("activeWaitlists")} value={data.activeWaitlists} />
          <Metric label={tm("activeMembers")} value={data.activeMembers} />
          <Metric
            label={tm("revenueCents")}
            value={data.revenueCentsTotal}
          />
        </ul>
      ) : null}
      <section className={`mt-10 ${adminChrome.panel}`}>
        <p className={adminChrome.panelHeading}>{t("csvExportTitle")}</p>
        <p className="mt-2">
          {t("csvExportBody", {
            code: "GET /v1/reports/bookings.csv?from=&to=",
          })}
        </p>
      </section>
    </AccountPageFrame>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <li className={adminChrome.metricCard}>
      <p className={adminChrome.metricLabel}>{label}</p>
      <p className={adminChrome.metricValue}>{value}</p>
    </li>
  );
}
