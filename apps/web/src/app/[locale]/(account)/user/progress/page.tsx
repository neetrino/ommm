import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type AchievementRow = {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
};

type MeResponse = {
  user: { email: string };
  achievements: AchievementRow[];
};

type BookingMine = {
  id: string;
  status: string;
  session: { startsAt: string; endsAt: string; classType: { name: string } };
};

type UserAnalyticsResponse = {
  totals: {
    completedClasses: number;
    totalHours: number;
    activeDays: number;
    favoriteClassType: string | null;
    spendCents: number;
  };
  membership: {
    planName: string;
    sessionsRemaining: number | null;
    sessionsPerMonth: number | null;
    isUnlimited: boolean;
    currentPeriodEnd: string;
  } | null;
  trend: {
    attendance: Array<{ date: string; count: number }>;
    spend: Array<{ date: string; amountCents: number }>;
  };
};

function formatMoneyFromCents(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AMD",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export default async function UserProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.progress" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [meRes, bookRes, analyticsRes] = await Promise.all([
    serverApiJson<MeResponse>("/users/me", cookie),
    serverApiJson<BookingMine[]>("/bookings/me", cookie),
    serverApiJson<UserAnalyticsResponse>("/reports/user/analytics?days=90", cookie),
  ]);

  if (!meRes.ok || !bookRes.ok || !analyticsRes.ok) {
    return (
      <AccountPageFrame title={t("title")} description={t("descriptionSignedOut")}>
        <p className="text-sm text-amber-900">{t("signInPrompt")}</p>
      </AccountPageFrame>
    );
  }

  const completed = bookRes.data.filter((b) => b.status === "COMPLETED");
  const analytics = analyticsRes.data;
  const attendanceTrend = analytics.trend.attendance.slice(-7);
  const spendTrend = analytics.trend.spend.slice(-7);

  return (
    <AccountPageFrame title={t("title")} description={t("descriptionSignedIn")}>
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("activitySummary")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("completedClasses")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {analytics.totals.completedClasses}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("allTime")}</p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("recentAttendance")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {attendanceTrend.reduce((sum, row) => sum + row.count, 0)}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("last7Days")}</p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("recentSpend")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {formatMoneyFromCents(
                  spendTrend.reduce((sum, row) => sum + row.amountCents, 0),
                  locale,
                )}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("last7Days")}</p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("membershipUsage")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {analytics.membership
                  ? analytics.membership.isUnlimited
                    ? t("unlimitedLabel")
                    : analytics.membership.sessionsRemaining ?? 0
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-sage-500">
                {analytics.membership
                  ? t("membershipPlanLabel", { plan: analytics.membership.planName })
                  : t("favoriteFallback")}
              </p>
            </li>
          </ul>
        </AccountSection>
        <AccountSection title={t("performanceMetrics")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("totalHours")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {analytics.totals.totalHours.toFixed(1)}
              </p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("activeDays")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {analytics.totals.activeDays}
              </p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700 sm:col-span-2">
              <p className="font-semibold text-sage-800">{t("favoriteClassType")}</p>
              <p className="mt-1 text-lg font-semibold text-sage-900">
                {analytics.totals.favoriteClassType ?? t("favoriteFallback")}
              </p>
            </li>
          </ul>
        </AccountSection>
        <AccountSection title={t("trendSection")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("attendanceTrend")}</p>
              <ul className="mt-2 space-y-1 text-xs text-sage-500">
                {attendanceTrend.map((point) => (
                  <li key={point.date}>
                    {new Date(point.date).toLocaleDateString(locale)}: {point.count}
                  </li>
                ))}
              </ul>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("spendTrend")}</p>
              <ul className="mt-2 space-y-1 text-xs text-sage-500">
                {spendTrend.map((point) => (
                  <li key={point.date}>
                    {new Date(point.date).toLocaleDateString(locale)}:{" "}
                    {formatMoneyFromCents(point.amountCents, locale)}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </AccountSection>

        <AccountSection title={t("achievements")}>
          {meRes.data.achievements.length === 0 ? (
            <p className="ommm-body-muted text-sm">{t("achievementsEmpty")}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {meRes.data.achievements.map((a) => (
                <li key={a.id} className="ommm-stack-card text-sm text-sage-700">
                  <p className="font-semibold text-sage-800">{a.title}</p>
                  <p className="mt-1 text-xs text-sage-500">{a.description}</p>
                  <p className="mt-2 text-xs text-sage-400">
                    {t("unlocked", {
                      date: new Date(a.unlockedAt).toLocaleDateString(locale),
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AccountSection>
      </div>
    </AccountPageFrame>
  );
}
