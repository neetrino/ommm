import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingScheduleSection } from "@/components/marketing/schedule/marketing-schedule-section";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";
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
    <section
      className={`${SCHEDULE_PAGE_BG} ommm-section flex-1 w-full min-h-[calc(100vh-10rem)]`}
      aria-label={t("pageTitle")}
    >
      <div className="ommm-container relative">
        <Suspense fallback={<MarketingPageContentSkeleton cards={1} />}>
          <MarketingScheduleSection locale={locale} />
        </Suspense>
      </div>
    </section>
  );
}
