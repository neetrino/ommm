import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { serverApiJson } from "@/lib/server-api";

type PanelSummary = {
  coachProfileId: string;
  todaySessions: number;
  bookedToday: number;
  activeWaitlistsForCoachSessions: number;
};

export default async function CoachAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.analytics" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<PanelSummary | null>(
    "/coaches/panel/summary",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? t("signInRequired")
          : t("loadFailed")}
      </div>
    );
  }

  if (res.data === null) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {t("noProfile")}
      </div>
    );
  }

  const d = res.data;
  const utilizationPercent =
    d.todaySessions > 0 ? Math.round((d.bookedToday / d.todaySessions) * 100) : 0;
  const waitlistPressure =
    d.todaySessions > 0
      ? Math.round((d.activeWaitlistsForCoachSessions / d.todaySessions) * 100)
      : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-indigo-950">{t("title")}</h1>
      <p className="mt-2 text-sm text-indigo-900/80">{t("lead")}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            {t("sessionsToday")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {d.todaySessions}
          </p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            {t("bookingsToday")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {d.bookedToday}
          </p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            {t("activeWaitlists")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {d.activeWaitlistsForCoachSessions}
          </p>
        </li>
      </ul>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            Utilization
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">{utilizationPercent}%</p>
          <p className="mt-1 text-xs text-indigo-900/70">
            {d.bookedToday} bookings over {d.todaySessions} sessions today.
          </p>
        </article>
        <article className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">
            Waitlist pressure
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">{waitlistPressure}%</p>
          <p className="mt-1 text-xs text-indigo-900/70">
            Active waitlists relative to today&apos;s session count.
          </p>
        </article>
      </section>
    </div>
  );
}
