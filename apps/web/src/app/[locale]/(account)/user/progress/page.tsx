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

type PeriodKey = "month" | "year" | "all";

function inPeriod(dateIso: string, period: PeriodKey): boolean {
  const d = new Date(dateIso);
  const now = new Date();
  if (period === "all") {
    return true;
  }
  if (period === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default async function UserProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.progress" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [meRes, bookRes] = await Promise.all([
    serverApiJson<MeResponse>("/users/me", cookie),
    serverApiJson<BookingMine[]>("/bookings/me", cookie),
  ]);

  if (!meRes.ok || !bookRes.ok) {
    return (
      <AccountPageFrame title={t("title")} description={t("descriptionSignedOut")}>
        <p className="text-sm text-amber-900">{t("signInPrompt")}</p>
      </AccountPageFrame>
    );
  }

  const completed = bookRes.data.filter((b) => b.status === "COMPLETED");
  const completedThisMonth = completed.filter((b) => inPeriod(b.session.startsAt, "month"));
  const completedThisYear = completed.filter((b) => inPeriod(b.session.startsAt, "year"));
  const completedAll = completed.filter((b) => inPeriod(b.session.startsAt, "all"));
  const hoursAll = completedAll.reduce((sum, b) => {
    const start = new Date(b.session.startsAt).getTime();
    const end = new Date(b.session.endsAt).getTime();
    const diffMinutes = Math.max(0, Math.round((end - start) / 60000));
    return sum + diffMinutes / 60;
  }, 0);
  const activeDaysAll = new Set(
    completedAll.map((b) => new Date(b.session.startsAt).toDateString()),
  ).size;
  const byClassType = new Map<string, number>();
  for (const booking of completedAll) {
    const key = booking.session.classType.name;
    byClassType.set(key, (byClassType.get(key) ?? 0) + 1);
  }
  const favoriteClassType = [...byClassType.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? t("favoriteFallback");

  return (
    <AccountPageFrame title={t("title")} description={t("descriptionSignedIn")}>
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("activitySummary")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("completedClasses")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {completed.length}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("allTime")}</p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("thisMonth")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {completedThisMonth.length}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("thisMonthCaption")}</p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("thisYear")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {completedThisYear.length}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("thisYearCaption")}</p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("allTime")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {completedAll.length}
              </p>
              <p className="mt-1 text-xs text-sage-500">{t("allTimeCaption")}</p>
            </li>
          </ul>
        </AccountSection>
        <AccountSection title={t("performanceMetrics")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("totalHours")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {hoursAll.toFixed(1)}
              </p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700">
              <p className="font-semibold text-sage-800">{t("activeDays")}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sage-900">
                {activeDaysAll}
              </p>
            </li>
            <li className="ommm-stack-card text-sm text-sage-700 sm:col-span-2">
              <p className="font-semibold text-sage-800">{t("favoriteClassType")}</p>
              <p className="mt-1 text-lg font-semibold text-sage-900">{favoriteClassType}</p>
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
