import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";
import { MarketingPackagesPageContent } from "@/components/marketing/packages/marketing-packages-page-content";

export default async function PackagesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingPageFrame
      title={m("membershipsPageTitle")}
      lede={m("membershipsPageLead")}
      extendToFooter
    >
      <Suspense fallback={<MarketingPageContentSkeleton cards={2} />}>
        <MarketingPackagesPageContent locale={locale} />
      </Suspense>
    </MarketingPageFrame>
  );
}
