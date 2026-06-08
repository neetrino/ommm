import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import {
  resolveMarketingPackageCategoryByKey,
} from "@/components/marketing/packages/packages-page-category-data";
import {
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
  const plansRes = await serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans", {
    cacheMode: "no-store",
  });

  if (!plansRes.ok) {
    return (
      <MarketingPageFrame title={m("packagesPageTitle")} lede={m("packagesPageLead")}>
        <p className="app-alert-warn" role="status">
          {m("packagesError")}
        </p>
      </MarketingPageFrame>
    );
  }

  const apiCategories = groupVisiblePublicPackageCategories(
    plansRes.data.filter((plan) => plan.isActive).map(normalizePublicPackagePlan),
  );
  const category =
    resolveMarketingPackageCategoryByKey(apiCategories, categoryKey) ??
    resolveCategoryByKey(apiCategories, categoryKey);

  if (category === null) {
    redirect(`/${locale}/packages`);
  }

  redirect(
    `/${locale}/packages?category=${encodeURIComponent(category.id)}`,
  );
}
