import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicPackageCategoryListTable } from "@/components/marketing/packages/public-package-category-list-table";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { listPublicPackageCategoryDisplayPlans } from "@/components/marketing/packages/public-package-category-display-plans";
import {
  categoryHasMultiplePricedTiers,
  resolveCategoryStartingPriceCents,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import { formatPublicPackagePriceParts } from "@/components/marketing/packages/public-package-card-format";
import styles from "@/components/marketing/packages/public-package-category-detail-section.module.css";
import { formatAmdFromCents } from "@/lib/price-amd";

type PublicPackageCategoryDetailSectionProps = {
  locale: string;
  category: PublicPackageCategoryGroup;
  audience: PublicPackageCategoryCardsAudience;
  backHref: string;
  showBackLink?: boolean;
  /** Marketing `/packages` — one card: category title + tier table only. */
  categoryTableOnly?: boolean;
  showLoginHint?: boolean;
};

export async function PublicPackageCategoryDetailSection({
  locale,
  category,
  audience,
  backHref,
  showBackLink = true,
  categoryTableOnly = false,
  showLoginHint = true,
}: PublicPackageCategoryDetailSectionProps) {
  const m = await getTranslations({ locale, namespace: "marketing" });
  const displayPlans = listPublicPackageCategoryDisplayPlans(category);

  const tierTable = (
    <Suspense fallback={null}>
      <PublicPackageCategoryListTable
        locale={locale}
        categoryLabel={category.label}
        plans={displayPlans}
        audience={audience}
        showGuestsColumn
      />
    </Suspense>
  );

  const loginHint = (
    <p className="text-center text-xs text-sage-500">
      {audience === "member" ? m("packagesMemberHint") : m("packagesLoginHint")}
    </p>
  );

  if (categoryTableOnly) {
    return (
      <div className={`${styles.root} space-y-6`} data-packages-detail="">
        {showBackLink ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
          >
            <span aria-hidden>←</span>
            {m("packagesBackToList")}
          </Link>
        ) : null}

        <section
          className={`ommm-card ${styles.categoryTableBlock} p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-6 lg:p-8`}
        >
          <h2 className={styles.categoryTableTitle}>{category.label}</h2>
          <div className={styles.tableSection}>{tierTable}</div>
        </section>

        {showLoginHint ? loginHint : null}
      </div>
    );
  }

  const startingPriceCents = resolveCategoryStartingPriceCents(displayPlans);
  const amount = formatAmdFromCents(startingPriceCents, locale);
  const { symbol, value } = formatPublicPackagePriceParts(amount);
  const showFromPrice = categoryHasMultiplePricedTiers(displayPlans);
  const description = category.plans
    .map((plan) => plan.description?.trim())
    .find((item) => item !== undefined && item.length > 0) ?? null;

  return (
    <div className={`${styles.root} space-y-6`} data-packages-detail="">
      {showBackLink ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <span aria-hidden>←</span>
          {m("packagesBackToList")}
        </Link>
      ) : null}

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
          {m("packagesDetailsTierCount", { count: displayPlans.length })}
        </p>
      </header>

      <section className={`ommm-card ${styles.tableSection} p-4 sm:p-6`}>{tierTable}</section>

      {showLoginHint ? loginHint : null}
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
