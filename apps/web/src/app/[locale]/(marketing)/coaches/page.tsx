import { getTranslations } from "next-intl/server";
import {
  buildCoachesPageFallbackCoaches,
  type CoachesPageSlideCopy,
} from "@/components/marketing/coaches/coaches-page-fallback-coaches";
import { MarketingPublicCoachesGrid } from "@/components/marketing/coaches/marketing-public-coaches-grid";
import { MarketingPublicCoachesPageSection, marketingPublicCoachesPageSectionStyles } from "@/components/marketing/coaches/marketing-public-coaches-page-section";
import type { CoachCardData } from "@/components/coaches/coach-card-display";
import { serverApiJsonPublic } from "@/lib/server-api";

type PublicCoach = CoachCardData;

export default async function CoachesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const tHome = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const res = await serverApiJsonPublic<PublicCoach[]>("/coaches");
  const fallbackCoaches = buildCoachesPageFallbackCoaches(
    tHome.raw("coachSlides") as CoachesPageSlideCopy[],
  );

  const coaches =
    res.ok && res.data.length > 0 ? res.data : fallbackCoaches;

  return (
    <MarketingPublicCoachesPageSection
      title={m("coachesPageTitle")}
      lead={m("coachesPageLead")}
    >
      {coaches.length > 0 ? (
        <MarketingPublicCoachesGrid coaches={coaches} />
      ) : (
        <p className={marketingPublicCoachesPageSectionStyles.status} role="status">
          {m("coachesEmpty")}
        </p>
      )}
    </MarketingPublicCoachesPageSection>
  );
}
