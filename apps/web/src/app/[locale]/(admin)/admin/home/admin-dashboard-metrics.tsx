import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

export async function AdminDashboardMetrics() {
  const t = await getTranslations("adminHome");
  const tm = await getTranslations("adminHome.metrics");
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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {t("pageTitle")}
      </h1>
      {err ? (
        <p className="mt-4 text-sm text-amber-800">{err}</p>
      ) : data ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="mt-10 rounded-[24px] border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
        <p className="font-medium text-zinc-900">{t("csvExportTitle")}</p>
        <p className="mt-2">
          {t("csvExportBody", {
            code: "GET /v1/reports/bookings.csv?from=&to=",
          })}
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <li className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </li>
  );
}
