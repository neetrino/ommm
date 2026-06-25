import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingSchedulePageLayout } from "@/components/marketing/schedule/marketing-schedule-page-content";
import { MarketingSchedulePageSection } from "@/components/marketing/schedule/marketing-schedule-page-section";

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
    <MarketingSchedulePageSection title={t("pageTitle")}>
      <MarketingSchedulePageLayout />
    </MarketingSchedulePageSection>
  );
}
