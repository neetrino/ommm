import { getTranslations } from "next-intl/server";
import { MarketingMembershipPageLayout } from "@/components/marketing/packages/marketing-membership-page-content";
import { MarketingMembershipPageSection } from "@/components/marketing/packages/marketing-membership-page-section";

export default async function PackagesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingMembershipPageSection title={m("packagesPageTitle")} lead={m("packagesPageLead")}>
      <MarketingMembershipPageLayout locale={locale} />
    </MarketingMembershipPageSection>
  );
}
