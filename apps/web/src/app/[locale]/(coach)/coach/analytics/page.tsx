import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { CoachAnalyticsPanel } from "@/components/coach/coach-analytics-panel";
import {
  coachAnalyticsDaysForPeriod,
  parseCoachAnalyticsPeriod,
  type CoachAnalyticsPayload,
} from "@/components/coach/coach-analytics-types";
import { serverApiJson } from "@/lib/server-api";

type CoachAnalyticsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ period?: string }>;
};

export default async function CoachAnalyticsPage({
  params,
  searchParams,
}: CoachAnalyticsPageProps) {
  const { locale } = await params;
  const { period: periodParam } = await searchParams;
  const period = parseCoachAnalyticsPeriod(periodParam);
  const days = coachAnalyticsDaysForPeriod(period);
  const t = await getTranslations({ locale, namespace: "coachPages.analytics" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<CoachAnalyticsPayload | null>(
    `/reports/coach/analytics?days=${days}`,
    cookie,
  );

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("signInRequired")
            : t("loadFailed")}
        </div>
      </AdminContentFrame>
    );
  }

  if (res.data === null) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("noProfile")}</div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <CoachAnalyticsPanel data={res.data} locale={locale} period={period} />
    </AdminContentFrame>
  );
}
