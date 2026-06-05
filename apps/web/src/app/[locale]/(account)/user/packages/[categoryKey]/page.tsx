import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
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

export default async function UserPackageCategoryPage({
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
      <MemberContentFrame description={m("packagesPageLead")}>
        <p className="ommm-body-muted text-sm">{m("packagesError")}</p>
      </MemberContentFrame>
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
    <MemberContentFrame description={m("packagesPageLead")}>
      <PublicPackageCategoryDetailSection
        locale={locale}
        category={category}
        audience="member"
        backHref="/user/packages"
      />
    </MemberContentFrame>
  );
}
