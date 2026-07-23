import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingSchedulePageLayout } from "@/components/marketing/schedule/marketing-schedule-page-content";
import { MarketingSchedulePageSection } from "@/components/marketing/schedule/marketing-schedule-page-section";
import { ScheduleEnglishLocaleProvider } from "@/components/marketing/schedule/schedule-english-locale-provider";
import { SCHEDULE_UI_LOCALE } from "@/lib/schedule-ui-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale: SCHEDULE_UI_LOCALE,
    namespace: "marketingPages.schedule",
  });
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
  };
}

export default async function ScheduleMarketingPage() {
  const t = await getTranslations({
    locale: SCHEDULE_UI_LOCALE,
    namespace: "marketingPages.schedule",
  });

  return (
    <ScheduleEnglishLocaleProvider>
      <MarketingSchedulePageSection title={t("pageTitle")}>
        <MarketingSchedulePageLayout />
      </MarketingSchedulePageSection>
    </ScheduleEnglishLocaleProvider>
  );
}
