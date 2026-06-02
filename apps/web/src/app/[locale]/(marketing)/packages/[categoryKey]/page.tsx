import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import {
  PublicPackageCategoryDetailSection,
  resolveCategoryByKey,
} from "@/components/marketing/packages/public-package-category-detail-section";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJsonPublic } from "@/lib/server-api";

export default async function MarketingPackageCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; categoryKey: string }>;
}) {
  const { locale, categoryKey } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const plansRes = await serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans");

  if (!plansRes.ok) {
    return (
      <MarketingPageFrame title={m("packagesPageTitle")} lede={m("packagesPageLead")}>
        <p className="app-alert-warn mt-12" role="status">
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

  return (
    <MarketingPageFrame title={category.label} lede={m("packagesPageLead")}>
      <div className="mt-12">
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
