import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicPackageCategoryListTable } from "@/components/marketing/packages/public-package-category-list-table";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  categoryHasMultiplePricedTiers,
  resolveCategoryStartingPriceCents,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import { formatPublicPackagePriceParts } from "@/components/marketing/packages/public-package-card-format";
import { formatAmdFromCents } from "@/lib/price-amd";

type PublicPackageCategoryDetailSectionProps = {
  locale: string;
  category: PublicPackageCategoryGroup;
  audience: PublicPackageCategoryCardsAudience;
  backHref: string;
};

export async function PublicPackageCategoryDetailSection({
  locale,
  category,
  audience,
  backHref,
}: PublicPackageCategoryDetailSectionProps) {
  const m = await getTranslations({ locale, namespace: "marketing" });
  const startingPriceCents = resolveCategoryStartingPriceCents(category.plans);
  const amount = formatAmdFromCents(startingPriceCents, locale);
  const { symbol, value } = formatPublicPackagePriceParts(amount);
  const showFromPrice = categoryHasMultiplePricedTiers(category.plans);
  const description = category.plans
    .map((plan) => plan.description?.trim())
    .find((item) => item !== undefined && item.length > 0) ?? null;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
      >
        <span aria-hidden>←</span>
        {m("packagesBackToList")}
      </Link>

      <header className="ommm-card p-6 sm:p-8">
        <h1 className="ommm-h2 text-sage-800">{category.label}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-sage-500">{description}</p>
        ) : null}
        <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
          {symbol.length > 0 ? <span className="mr-1.5 text-black">{symbol}</span> : null}
          {showFromPrice
            ? m("packagesPriceFromLine", { amount: value })
            : m("packagesPriceLine", { amount: value })}
        </p>
        <p className="mt-2 text-sm text-sage-500">
          {m("packagesDetailsTierCount", { count: category.plans.length })}
        </p>
      </header>

      <section className="ommm-card overflow-hidden p-4 sm:p-6">
        <Suspense fallback={null}>
          <PublicPackageCategoryListTable
            locale={locale}
            categoryLabel={category.label}
            plans={category.plans}
            audience={audience}
          />
        </Suspense>
      </section>

      {audience === "member" ? (
        <p className="text-center text-xs text-sage-500">{m("packagesMemberHint")}</p>
      ) : (
        <p className="text-center text-xs text-sage-500">{m("packagesLoginHint")}</p>
      )}
    </div>
  );
}

export function resolveCategoryByKey(
  categories: readonly PublicPackageCategoryGroup[],
  categoryKey: string,
): PublicPackageCategoryGroup | null {
  const decoded = decodeURIComponent(categoryKey);
  return categories.find((category) => category.id === decoded) ?? null;
}
