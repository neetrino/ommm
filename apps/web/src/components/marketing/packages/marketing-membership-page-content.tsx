import { Suspense } from "react";
import { MarketingMembershipPackagesSkeleton } from "@/components/marketing/packages/marketing-membership-packages-skeleton";
import { MarketingPackagesPageContent } from "@/components/marketing/packages/marketing-packages-page-content";

type MarketingMembershipPageLayoutProps = {
  locale: string;
};

/** Membership cards stream from the server like Coaches — hero stays instant above. */
export function MarketingMembershipPageLayout({ locale }: MarketingMembershipPageLayoutProps) {
  return (
    <Suspense fallback={<MarketingMembershipPackagesSkeleton />}>
      <MarketingPackagesPageContent locale={locale} />
    </Suspense>
  );
}
