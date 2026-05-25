import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { MarketingPublicCoachesGrid } from "@/components/marketing/coaches/marketing-public-coaches-grid";
import { serverApiJson } from "@/lib/server-api";

type PublicCoach = {
  id: string;
  bio: string | null;
  specialization: string | null;
  experienceYears: number | null;
  user: { name: string | null; email: string; avatarUrl: string | null };
};

export default async function CoachesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const res = await serverApiJson<PublicCoach[]>("/coaches", "");

  return (
    <MarketingPageFrame title={m("coachesPageTitle")} lede={m("coachesPageLead")}>
      {!res.ok ? (
        <p className="app-alert-warn mt-12" role="status">
          {m("coachesError")}
        </p>
      ) : res.data.length === 0 ? (
        <p
          className="ommm-card mt-12 p-5 text-sm text-sage-500 sm:p-6"
          role="status"
        >
          {m("coachesEmpty")}
        </p>
      ) : (
        <MarketingPublicCoachesGrid coaches={res.data} />
      )}
    </MarketingPageFrame>
  );
}
