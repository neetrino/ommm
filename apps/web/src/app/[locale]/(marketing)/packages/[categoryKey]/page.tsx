import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import {
  PublicPackageCategoryDetailSection,
  resolveCategoryByKey,
} from "@/components/marketing/packages/public-package-category-detail-section";
import { isDancesPackageCategory } from "@/components/marketing/packages/public-package-category-dances";
import { isMatPilatesPackageCategory } from "@/components/marketing/packages/public-package-category-mat-pilates";
import { isYogaPackageCategory } from "@/components/marketing/packages/public-package-category-yoga";
import { isReformerIndividualPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-individual";
import { isReformerGroupPackageCategory } from "@/components/marketing/packages/public-package-category-reformer-group";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJsonPublic } from "@/lib/server-api";

export default async function MarketingPackageCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; categoryKey: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale, categoryKey } = await params;
  const { plan } = await searchParams;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const plansRes = await serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans");

  if (!plansRes.ok) {
    return (
      <MarketingPageFrame title={m("packagesPageTitle")} lede={m("packagesPageLead")}>
        <p className="app-alert-warn" role="status">
          {m("packagesError")}
        </p>
      </MarketingPageFrame>
    );
  }

  const categories = groupVisiblePublicPackageCategories(
    plansRes.data.filter((plan) => plan.isActive).map(normalizePublicPackagePlan),
  );
  const category = resolveCategoryByKey(categories, categoryKey);

  if (category === null) {
    notFound();
  }

  if (
    isDancesPackageCategory(category) ||
    isReformerGroupPackageCategory(category) ||
    isReformerIndividualPackageCategory(category) ||
    isMatPilatesPackageCategory(category) ||
    isYogaPackageCategory(category)
  ) {
    const planQuery =
      plan !== undefined && plan.length > 0 ? `?plan=${encodeURIComponent(plan)}` : "";
    redirect(`/${locale}/packages${planQuery}`);
  }

  return (
    <MarketingPageFrame title={category.label} lede={m("packagesPageLead")}>
      <div className="w-full min-w-0">
        <PublicPackageCategoryDetailSection
          locale={locale}
          category={category}
          audience="guest"
          backHref="/packages"
        />
      </div>
    </MarketingPageFrame>
  );
}
