import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { isManagerDashboardRole } from "@/lib/role-home";
import { serverApiJson } from "@/lib/server-api";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";

type MeResponse = {
  user: { role: string; name: string | null };
};

type DashboardSummary = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
};

export default async function ManagerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [meRes, dashboardRes] = await Promise.all([
    serverApiJson<MeResponse>("/users/me", cookie),
    serverApiJson<DashboardSummary>("/reports/dashboard", cookie),
  ]);
  if (!meRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>Sign in to open the manager workspace.</p>
        <Link href="/login" className="ommm-cta-primary mt-4 inline-flex text-sm">
          {tCommon("login")}
        </Link>
      </div>
    );
  }

  if (!isManagerDashboardRole(meRes.data.user.role)) {
    redirectToRoleHome(locale, meRes.data.user.role);
  }

  const name = meRes.data.user.name?.trim();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Manager workspace
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Hi{name ? `, ${name}` : ""} — studio operations overview. Use Bookings
        and Clients when your account has access.
      </p>
      <section className="mt-8 rounded-[24px] border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
        <p className="font-medium text-zinc-900">Next steps</p>
        <p className="mt-2 text-zinc-600">
          Manage classes, bookings, waitlists, clients, coaches, and gift cards.
          Billing and studio-level settings remain admin-only.
        </p>
      </section>
      {dashboardRes.ok ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">Sessions today</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.sessionsToday}
            </p>
          </li>
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">Bookings today</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.bookingsToday}
            </p>
          </li>
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">Active waitlists</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.activeWaitlists}
            </p>
          </li>
          <li className="rounded-[20px] border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="text-xs uppercase text-zinc-500">Active members</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {dashboardRes.data.activeMembers}
            </p>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
