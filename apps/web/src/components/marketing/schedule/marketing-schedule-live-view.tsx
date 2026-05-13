import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";

export async function MarketingScheduleLiveView({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";
  const { items, loadErrorStatus } = await fetchPublicScheduleItems(cookie);

  if (loadErrorStatus !== null) {
    return <p className="app-alert-warn mt-6">{t("loadFailed", { status: loadErrorStatus })}</p>;
  }

  const sessions = items;

  return (
    <div className="ommm-card p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-[clamp(1.6rem,1.8vw+1rem,2.2rem)] italic font-semibold tracking-tight text-sage-900">
          {t("title")}
        </h1>
        <div className="flex gap-2">
          <Link href="/login" className="ommm-cta-ghost text-sm">
            {t("loginCta")}
          </Link>
          <Link href="/register" className="ommm-cta-primary text-sm">
            {t("registerCta")}
          </Link>
        </div>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-6 text-sm text-sage-600">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {sessions.map((s) => {
            return (
              <li key={s.id} className="ommm-list-row">
                <div>
                  <p className="font-medium text-sage-900">{s.className}</p>
                  <p className="text-sm text-sage-600">
                    {`${t(`days.${s.dayOfWeek}`)} · ${s.startTime}${s.endTime ? ` - ${s.endTime}` : ""}`}
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    {(s.instructorName || t("coach")) +
                      " · " +
                      t("capacity", { capacity: s.availableSpots })}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link href="/register" className="ommm-cta-primary text-sm">
                    {t("bookCta")}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
