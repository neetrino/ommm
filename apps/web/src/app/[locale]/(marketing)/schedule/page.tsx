import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingSchedulePageLayout } from "@/components/marketing/schedule/marketing-schedule-page-content";
import { MarketingSchedulePageSection } from "@/components/marketing/schedule/marketing-schedule-page-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketingPages.schedule");
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
  };
}

export default async function ScheduleMarketingPage() {
  const t = await getTranslations("marketingPages.schedule");

  return (
    <MarketingSchedulePageSection>
      <MarketingSchedulePageLayout title={t("pageTitle")} />
    </MarketingSchedulePageSection>
  );
}
