import { headers } from "next/headers";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

export default async function AdminDashboardPage() {
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
    err = "Fetch failed (is the API running?)";
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Admin dashboard
      </h1>
      {err ? (
        <p className="mt-4 text-sm text-amber-800">{err}</p>
      ) : data ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Sessions today" value={data.sessionsToday} />
          <Metric label="Bookings today" value={data.bookingsToday} />
          <Metric label="Active waitlists" value={data.activeWaitlists} />
          <Metric label="Active members" value={data.activeMembers} />
          <Metric
            label="Revenue (cents, total recorded)"
            value={data.revenueCentsTotal}
          />
        </ul>
      ) : null}
      <section className="mt-10 rounded-[24px] border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
        <p className="font-medium text-zinc-900">CSV export (admin only)</p>
        <p className="mt-2">
          Use the API{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs">
            GET /v1/reports/bookings.csv?from=&amp;to=
          </code>{" "}
          with an authenticated admin session.
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
