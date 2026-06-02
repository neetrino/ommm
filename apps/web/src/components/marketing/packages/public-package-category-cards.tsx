import { getTranslations } from "next-intl/server";
import {
  formatPublicPackagePriceParts,
  formatPublicPackageTierPriceLine,
  shouldShowPublicPackageTierName,
} from "@/components/marketing/packages/public-package-card-format";
import { PackageCategoryCardFooter } from "@/components/marketing/packages/package-category-card-footer";
import {
  categoryHasMultiplePricedTiers,
  listCategoryDisplayPlans,
  resolveCategoryStartingPriceCents,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
import { formatAmdFromCents } from "@/lib/price-amd";

export type PublicPackageCategoryCardsAudience = "guest" | "member";

type PublicPackageCategoryCardsProps = {
  locale: string;
  categories: readonly PublicPackageCategoryGroup[];
  audience?: PublicPackageCategoryCardsAudience;
};

export async function PublicPackageCategoryCards({
  locale,
  categories,
  audience = "guest",
}: PublicPackageCategoryCardsProps) {
  const m = await getTranslations({ locale, namespace: "marketing" });

  if (categories.length === 0) {
    return (
      <p className="ommm-card p-5 text-sm text-sage-500 sm:p-6" role="status">
        {m("packagesEmpty")}
      </p>
    );
  }

  return (
    <ul className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
      {categories.map((category) => {
        const startingPriceCents = resolveCategoryStartingPriceCents(category.plans);
        const amount = formatAmdFromCents(startingPriceCents, locale);
        const { symbol, value } = formatPublicPackagePriceParts(amount);
        const showFromPrice = categoryHasMultiplePricedTiers(category.plans);
        const displayPlans = listCategoryDisplayPlans(category.plans);
        const description = category.plans
          .map((plan) => plan.description?.trim())
          .find((value) => value !== undefined && value.length > 0);
        const isPopular = category.plans.some((plan) => plan.isPopular);

        return (
          <li
            key={category.id}
            className={`ommm-card ommm-package-card-hover flex h-full min-h-0 flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8 ${isPopular ? "ring-2 ring-sand-400/70" : ""}`}
          >
            <div>
              <h2 className="ommm-h3 text-sage-800">{category.label}</h2>
              {description ? (
                <p className="mt-3 text-sm leading-relaxed text-sage-500">{description}</p>
              ) : null}
              <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
                {symbol.length > 0 ? (
                  <span className="mr-1.5 text-black">{symbol}</span>
                ) : null}
                {showFromPrice
                  ? m("packagesPriceFromLine", { amount: value })
                  : m("packagesPriceLine", { amount: value })}
              </p>
              <p className="mt-2 text-sm text-sage-500">
                {m("packagesCategoryTierCount", { count: displayPlans.length })}
              </p>
            </div>
            <ul className="mt-6 flex-1 space-y-4 border-t border-white/50 pt-6">
              {displayPlans.map((plan) => {
                const sessionsLabel = plan.isUnlimited
                  ? m("packagesSessionsUnlimited")
                  : m("packagesSessionsCount", {
                      count: plan.sessionsPerMonth ?? 0,
                    });
                const guestCount = plan.guestCount ?? 0;
                const tierPriceLine = formatPublicPackageTierPriceLine(
                  plan.priceCents,
                  locale,
                  (values) => m("packagesPriceLine", values),
                );

                return (
                  <li
                    key={plan.id}
                    className="rounded-2xl border border-white/60 bg-white/40 p-4"
                  >
                    {shouldShowPublicPackageTierName(plan.name, category.label) ? (
                      <p className="text-sm font-semibold text-sage-800">{plan.name}</p>
                    ) : null}
                    <p className="mt-1 text-sm font-medium text-sage-700">{tierPriceLine}</p>
                    <p className="mt-1 text-sm text-sage-500">
                      {plan.billingPeriod} ·{" "}
                      {m("packagesPeriodDaysShort", { days: plan.periodDays })}
                    </p>
                    <p className="mt-2 text-sm text-sage-600">{sessionsLabel}</p>
                    {guestCount > 0 ? (
                      <p className="mt-1 text-sm text-sage-500">
                        {m("packagesGuestCount", { count: guestCount })}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <PackageCategoryCardFooter
              audience={audience}
              subscribeLabel={m("packagesSubscribeCta")}
              accountLabel={m("packagesAccountCta")}
              hint={audience === "member" ? m("packagesMemberHint") : m("packagesLoginHint")}
              locale={locale}
              plans={toPackageSubscribePlanOptions(displayPlans)}
            />
          </li>
        );
      })}
    </ul>
  );
}
