import { getTranslations } from "next-intl/server";
import type { CoachCardData } from "@/components/coaches/coach-card-display";
import type { CoachSlideCopy } from "@/components/marketing/home/featured-coach-slide-card";
import { buildFeaturedCoachSlides } from "@/components/marketing/home/home-featured-coach-slides";
import { MarketingPublicHomeCoachesSection } from "@/components/marketing/home/marketing-public-home-coaches-section";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";

type MarketingPublicHomeCoachesSectionServerProps = {
  locale: string;
};

export async function MarketingPublicHomeCoachesSectionServer({
  locale,
}: MarketingPublicHomeCoachesSectionServerProps) {
  const [tHome, tMarketing, coachesRes] = await Promise.all([
    getTranslations({ locale, namespace: "marketingPublic.home" }),
    getTranslations({ locale, namespace: "marketing" }),
    fetchPublicJsonCached<CoachCardData[]>("/coaches"),
  ]);

  const fallbackSlides = tHome.raw("coachSlides") as CoachSlideCopy[];
  const slides = buildFeaturedCoachSlides(
    coachesRes.ok ? coachesRes.data : [],
    fallbackSlides,
    (years) => tMarketing("coachesExperience", { years }),
  );

  if (slides.length === 0) {
    return null;
  }

  return <MarketingPublicHomeCoachesSection slides={slides} />;
}
