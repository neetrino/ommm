import { getTranslations } from "next-intl/server";
import { PublicPackageCategoryDetailSection } from "@/components/marketing/packages/public-package-category-detail-section";
import { MARKETING_LAZY_SECTION } from "@/components/marketing/marketing-lazy-section-tokens";
import { MarketingProgressiveRevealSection } from "@/components/marketing/marketing-progressive-reveal-section";
import { resolveMarketingDancesPackageCategory } from "@/components/marketing/packages/public-package-category-dances";
import { resolveMarketingMatPilatesPackageCategory } from "@/components/marketing/packages/public-package-category-mat-pilates";
import { resolveMarketingReformerIndividualPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-individual";
import { resolveMarketingYogaPackageCategory } from "@/components/marketing/packages/public-package-category-yoga";
import { resolveMarketingReformerGroupPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-group";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";

type MarketingPackagesPageContentProps = {
  locale: string;
};

export async function MarketingPackagesPageContent({
  locale,
}: MarketingPackagesPageContentProps) {
  const m = await getTranslations({ locale, namespace: "marketing" });
  const res = await fetchPublicJsonCached<PublicPackagePlan[]>("/packages/plans");
  const apiCategories = res.ok
    ? groupVisiblePublicPackageCategories(
        res.data.filter((plan) => plan.isActive).map(normalizePublicPackagePlan),
      )
    : [];

  const marketingCategories = [
    resolveMarketingReformerGroupPackageCategory(apiCategories),
    resolveMarketingReformerIndividualPackageCategory(apiCategories),
    resolveMarketingMatPilatesPackageCategory(apiCategories),
    resolveMarketingYogaPackageCategory(apiCategories),
    resolveMarketingDancesPackageCategory(apiCategories),
  ];

  return (
    <div className="space-y-8">
      {!res.ok ? (
        <p className="app-alert-warn" role="status">
          {m("packagesError")}
        </p>
      ) : null}
      {marketingCategories.map((category) => (
        <MarketingProgressiveRevealSection
          key={category.id}
          id={`packages-${category.id}`}
          preloadMarginPx={MARKETING_LAZY_SECTION.preloadMarginPx}
          mountMarginPx={MARKETING_LAZY_SECTION.mountMarginPx}
          placeholderClassName={MARKETING_LAZY_SECTION.placeholders.packageCategory}
        >
          <PublicPackageCategoryDetailSection
            locale={locale}
            category={category}
            audience="guest"
            backHref="/packages"
            showBackLink={false}
            categoryTableOnly
            showLoginHint={false}
          />
        </MarketingProgressiveRevealSection>
      ))}
      <p className="text-center text-xs text-sage-500">{m("packagesLoginHint")}</p>
    </div>
  );
}
