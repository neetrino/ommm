import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MarketingMembershipPageSection } from "@/components/marketing/packages/marketing-membership-page-section";
import { MarketingMembershipPackagesSkeleton } from "@/components/marketing/packages/marketing-membership-packages-skeleton";
import { MarketingPackagesPageContent } from "@/components/marketing/packages/marketing-packages-page-content";

/** Canonical marketing packages URL is `/package`; keep `/packages` as a real page (no redirect hop). */
export default async function PackagesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingMembershipPageSection title={m("packagesPageTitle")} lead={m("packagesPageLead")}>
      <Suspense fallback={<MarketingMembershipPackagesSkeleton />}>
        <MarketingPackagesPageContent locale={locale} />
      </Suspense>
    </MarketingMembershipPageSection>
  );
}
