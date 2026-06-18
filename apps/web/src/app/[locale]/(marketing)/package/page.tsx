import { getTranslations } from "next-intl/server";
import { MarketingMembershipPageSection } from "@/components/marketing/packages/marketing-membership-page-section";

export default async function PackageMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingMembershipPageSection title={m("packagesPageTitle")} lead={m("packagesPageLead")}>
      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-sage-700">
        Packages module is empty. New logic will be rebuilt from zero.
      </div>
    </MarketingMembershipPageSection>
  );
}
