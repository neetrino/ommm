import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { MarketingScheduleView } from "@/components/marketing/schedule/marketing-schedule-view";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";

export async function MarketingScheduleSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";
  const { items, loadErrorStatus } = await fetchPublicScheduleItems(cookie);

  if (loadErrorStatus !== null) {
    return (
      <div className="ommm-card p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        <p className="app-alert-warn text-sm">{t("loadFailed", { status: loadErrorStatus })}</p>
      </div>
    );
  }

  return <MarketingScheduleView initialItems={items} />;
}
