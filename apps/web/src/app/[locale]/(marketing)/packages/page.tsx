import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { PublicPackageCategoryCards } from "@/components/marketing/packages/public-package-category-cards";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJsonPublic } from "@/lib/server-api";

export default async function PackagesMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const res = await serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans");

  const activePlans = res.ok
    ? res.data
        .filter((plan) => plan.isActive)
        .map(normalizePublicPackagePlan)
    : [];
  const categories = groupVisiblePublicPackageCategories(activePlans);

  return (
    <MarketingPageFrame
      title={m("packagesPageTitle")}
      lede={m("packagesPageLead")}
    >
      {!res.ok ? (
        <p className="app-alert-warn mt-12" role="status">
          {m("packagesError")}
        </p>
      ) : (
        <>
          <div className="mt-12">
            <PublicPackageCategoryCards
              locale={locale}
              categories={categories}
              audience="guest"
            />
          </div>
          <section className="mt-16 max-w-3xl">
            <h2 className="ommm-h2 text-sage-800">{m("packagesFaqTitle")}</h2>
            <dl className="mt-6 space-y-6 text-sm text-sage-700">
              <div>
                <dt className="font-semibold text-sage-800">
                  {m("packagesFaqPauseQuestion")}
                </dt>
                <dd className="mt-1 text-sage-600">{m("packagesFaqPauseAnswer")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-sage-800">
                  {m("packagesFaqBillingQuestion")}
                </dt>
                <dd className="mt-1 text-sage-600">{m("packagesFaqBillingAnswer")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-sage-800">
                  {m("packagesFaqWaitlistQuestion")}
                </dt>
                <dd className="mt-1 text-sage-600">{m("packagesFaqWaitlistAnswer")}</dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </MarketingPageFrame>
  );
}
