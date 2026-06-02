import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  categoryHasMultiplePricedTiers,
  groupVisiblePublicPackageCategories,
  listCategoryDisplayPlans,
  resolveCategoryStartingPriceCents,
} from "@/lib/public-package-categories";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJsonPublic } from "@/lib/server-api";

function formatPriceLineAmount(amount: string): { symbol: string; value: string } {
  if (amount.startsWith("֏")) {
    return { symbol: "֏", value: amount.slice(1).trimStart() };
  }
  return { symbol: "", value: amount };
}

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
      ) : categories.length === 0 ? (
        <p
          className="ommm-card mt-12 p-5 text-sm text-sage-500 sm:p-6"
          role="status"
        >
          {m("packagesEmpty")}
        </p>
      ) : (
        <>
          <ul className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-stretch">
            {categories.map((category) => {
              const startingPriceCents = resolveCategoryStartingPriceCents(category.plans);
              const amount = formatAmdFromCents(startingPriceCents, locale);
              const { symbol, value } = formatPriceLineAmount(amount);
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
                      const tierAmount = formatAmdFromCents(plan.priceCents, locale);
                      const tierPrice = formatPriceLineAmount(tierAmount);
                      const sessionsLabel = plan.isUnlimited
                        ? m("packagesSessionsUnlimited")
                        : m("packagesSessionsCount", {
                            count: plan.sessionsPerMonth ?? 0,
                          });
                      const guestCount = plan.guestCount ?? 0;
                      const showTierName =
                        normalizeTierLabel(plan.name) !==
                        normalizeTierLabel(category.label);

                      return (
                        <li
                          key={plan.id}
                          className="rounded-2xl border border-white/60 bg-white/40 p-4"
                        >
                          {showTierName ? (
                            <p className="text-sm font-semibold text-sage-800">{plan.name}</p>
                          ) : null}
                          <p className="mt-1 text-sm font-medium text-sage-700">
                            {tierPrice.symbol.length > 0 ? `${tierPrice.symbol} ` : ""}
                            {m("packagesPriceLine", { amount: tierPrice.value })}
                          </p>
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
                  <div className="mt-8 border-t border-white/50 pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link href="/login" className="ommm-cta-primary flex-1 text-center">
                        {m("packagesSubscribeCta")}
                      </Link>
                      <Link href="/login" className="ommm-cta-ghost flex-1 text-center">
                        {m("packagesAccountCta")}
                      </Link>
                    </div>
                    <p className="mt-4 text-center text-xs text-sage-500">
                      {m("packagesLoginHint")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
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

function normalizeTierLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}
