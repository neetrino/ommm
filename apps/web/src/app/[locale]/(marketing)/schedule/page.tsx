import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingScheduleView } from "@/components/marketing/schedule/marketing-schedule-view";
import { SCHEDULE_PAGE_BG } from "@/components/marketing/schedule/schedule-public-design";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
  };
}

export default async function ScheduleMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });

  return (
    <section className={`${SCHEDULE_PAGE_BG} w-full py-8 sm:py-10 lg:py-12`} aria-label={t("pageTitle")}>
      <div className="ommm-container">
        <MarketingScheduleView />
      </div>
    </section>
  );
}
