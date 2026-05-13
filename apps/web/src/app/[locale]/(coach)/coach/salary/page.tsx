import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { serverApiJson } from "@/lib/server-api";

type SalarySummary = {
  totalEarningsCents: number;
  pendingPayoutCents: number;
  paidOutCents: number;
  completedSessions: number;
  basePerSessionCents: number;
  perAttendeeShareCents: number;
};

export default async function CoachSalaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.salary" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<SalarySummary | null>("/coaches/panel/salary", cookie);

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {t("loadFailed", { status: res.status })}
      </div>
    );
  }

  if (res.data == null) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {t("noProfile")}
      </div>
    );
  }

  const data = res.data;
  const formatMoney = (cents: number) => (cents / 100).toFixed(2);
  return (
    <div>
      <h1 className="text-2xl font-semibold text-indigo-950">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-indigo-900/80">{t("lead")}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">{t("total")}</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">{formatMoney(data.totalEarningsCents)}</p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">{t("pending")}</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">{formatMoney(data.pendingPayoutCents)}</p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">{t("paid")}</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">{formatMoney(data.paidOutCents)}</p>
        </li>
        <li className="rounded-[20px] border border-indigo-100 bg-white p-4 text-sm shadow-sm">
          <p className="text-xs font-medium uppercase text-indigo-900/70">{t("sessions")}</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-950">{data.completedSessions}</p>
        </li>
      </ul>
      <p className="mt-6 text-sm text-indigo-900/80">
        {t("formula", {
          base: formatMoney(data.basePerSessionCents),
          perAttendee: formatMoney(data.perAttendeeShareCents),
        })}
      </p>
    </div>
  );
}
