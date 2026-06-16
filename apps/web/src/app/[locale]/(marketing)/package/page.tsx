import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingMembershipPackagesSkeleton } from "@/components/marketing/packages/marketing-membership-packages-skeleton";
import { MarketingMembershipPageSection } from "@/components/marketing/packages/marketing-membership-page-section";
import { MarketingPackagesPageContent } from "@/components/marketing/packages/marketing-packages-page-content";

export default async function PackageMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingMembershipPageSection title={m("packagesPageTitle")} lead={m("packagesPageLead")}>
      <Suspense fallback={<MarketingMembershipPackagesSkeleton />}>
        <MarketingPackagesPageContent locale={locale} desktopCardsPerRow={3} />
      </Suspense>
    </MarketingMembershipPageSection>
  );
}
