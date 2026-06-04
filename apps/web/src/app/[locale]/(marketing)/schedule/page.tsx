import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPublicPageSection } from "@/components/marketing/marketing-public-page-section";
import { MarketingScheduleSection } from "@/components/marketing/schedule/marketing-schedule-section";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";

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
    <MarketingPublicPageSection
      title={t("pageTitle")}
      headerAside={
        <Link href="/user/classes" className="block pt-1 sm:pt-2">
          {t("myAccount")}
        </Link>
      }
    >
      <Suspense fallback={<MarketingPageContentSkeleton cards={1} />}>
        <MarketingScheduleSection locale={locale} />
      </Suspense>
    </MarketingPublicPageSection>
  );
}
