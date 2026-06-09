import { getTranslations } from "next-intl/server";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import { buildPackagesPageAccordionCategories } from "@/components/marketing/packages/packages-page-category-data";
import { PackagesPageAccordion } from "@/components/marketing/packages/packages-page-accordion";
import { PackagesPageLoginHint } from "@/components/marketing/packages/packages-page-login-hint";
import { PackagesPageReveal } from "@/components/marketing/packages/packages-page-reveal";
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

  const categories = buildPackagesPageAccordionCategories(apiCategories, locale, {
    priceFromPrefix: m("packagesCardPriceFromPrefix"),
  });

  return (
    <div className={`w-full min-w-0 ${cardStyles.packagesPageRoot}`} data-packages-accordion="">
      {!res.ok ? (
        <PackagesPageReveal index={0}>
          <p className="app-alert-warn mb-6" role="status">
            {m("packagesError")}
          </p>
        </PackagesPageReveal>
      ) : null}
      <PackagesPageAccordion locale={locale} categories={categories} />
      <PackagesPageLoginHint index={categories.length} />
    </div>
  );
}
