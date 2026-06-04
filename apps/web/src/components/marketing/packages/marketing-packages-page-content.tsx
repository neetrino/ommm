import { getTranslations } from "next-intl/server";
import { PublicPackageCategoryCards } from "@/components/marketing/packages/public-package-category-cards";
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
  const categories = res.ok
    ? groupVisiblePublicPackageCategories(
        res.data.filter((plan) => plan.isActive).map(normalizePublicPackagePlan),
      )
    : [];

  if (!res.ok) {
    return (
      <p className="app-alert-warn" role="status">
        {m("packagesError")}
      </p>
    );
  }

  return (
    <>
      <div>
        <PublicPackageCategoryCards locale={locale} categories={categories} />
      </div>
      <section className="mt-16 w-full min-w-0">
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
            <dd className="mt-1 text-sage-600">
              {m("packagesFaqBillingAnswer")}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-sage-800">
              {m("packagesFaqWaitlistQuestion")}
            </dt>
            <dd className="mt-1 text-sage-600">
              {m("packagesFaqWaitlistAnswer")}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
