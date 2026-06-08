import { getTranslations } from "next-intl/server";
import {
  buildCoachesPageFallbackCoaches,
  type CoachesPageSlideCopy,
} from "@/components/marketing/coaches/coaches-page-fallback-coaches";
import { MarketingPublicCoachesGrid } from "@/components/marketing/coaches/marketing-public-coaches-grid";
import {
  marketingPublicCoachesPageSectionStyles,
} from "@/components/marketing/coaches/marketing-public-coaches-page-section";
import { fetchPublicCoachesListCached } from "@/lib/fetch-public-coaches";

type MarketingCoachesPageContentProps = {
  locale: string;
};

export async function MarketingCoachesPageContent({
  locale,
}: MarketingCoachesPageContentProps) {
  const [m, tHome, res] = await Promise.all([
    getTranslations({ locale, namespace: "marketing" }),
    getTranslations({ locale, namespace: "marketingPublic.home" }),
    fetchPublicCoachesListCached(),
  ]);

  const fallbackCoaches = buildCoachesPageFallbackCoaches(
    tHome.raw("coachSlides") as CoachesPageSlideCopy[],
  );
  const coaches =
    res.ok && res.data.length > 0 ? res.data : fallbackCoaches;

  if (coaches.length === 0) {
    return (
      <p className={marketingPublicCoachesPageSectionStyles.status} role="status">
        {m("coachesEmpty")}
      </p>
    );
  }

  return <MarketingPublicCoachesGrid coaches={coaches} />;
}
