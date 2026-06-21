import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingCoachesPageContent } from "@/components/marketing/coaches/marketing-coaches-page-content";
import { MarketingPublicCoachesPageSection } from "@/components/marketing/coaches/marketing-public-coaches-page-section";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";
import { ensureMarketingSectionEnabled } from "@/server/ensure-marketing-section-enabled";

export default async function CoachesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await ensureMarketingSectionEnabled("coaches");
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingPublicCoachesPageSection
      title={m("coachesPageTitle")}
      lead={m("coachesPageLead")}
    >
      <Suspense fallback={<MarketingPageContentSkeleton cards={3} />}>
        <MarketingCoachesPageContent locale={locale} />
      </Suspense>
    </MarketingPublicCoachesPageSection>
  );
}
