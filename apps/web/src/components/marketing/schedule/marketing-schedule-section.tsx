import { getTranslations } from "next-intl/server";
import { MarketingScheduleViewDeferred } from "@/components/marketing/marketing-deferred-sections";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { resolveMarketingAudience } from "@/lib/marketing-audience";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

export async function MarketingScheduleSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });
  const [scheduleData, authUser] = await Promise.all([
    fetchPublicScheduleItems(),
    getOptionalLayoutAuthUser(),
  ]);
  const { items, loadErrorStatus } = scheduleData;
  const audience = resolveMarketingAudience(authUser);

  if (loadErrorStatus !== null) {
    return (
      <div className="ommm-card w-full min-w-0 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        <p className="app-alert-warn text-sm">{t("loadFailed", { status: loadErrorStatus })}</p>
      </div>
    );
  }

  return <MarketingScheduleViewDeferred initialItems={items} audience={audience} />;
}
