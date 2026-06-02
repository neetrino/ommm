"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  formatPublicPackagePriceParts,
  formatPublicPackageTierPriceLine,
  shouldShowPublicPackageTierName,
} from "@/components/marketing/packages/public-package-card-format";
import { PackageCategoryCardFooter } from "@/components/marketing/packages/package-category-card-footer";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  categoryHasMultiplePricedTiers,
  listCategoryDisplayPlans,
  resolveCategoryStartingPriceCents,
  type PublicPackageCategoryGroup,
} from "@/lib/public-package-categories";
import { buildPackageCategoryHref } from "@/lib/package-category-href";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";
import { formatAmdFromCents } from "@/lib/price-amd";

type PublicPackageCategoryCardProps = {
  locale: string;
  category: PublicPackageCategoryGroup;
  audience?: PublicPackageCategoryCardsAudience;
};

export function PublicPackageCategoryCard({
  locale,
  category,
  audience = "guest",
}: PublicPackageCategoryCardProps) {
  const t = useTranslations("marketing");
  const [paymentOpen, setPaymentOpen] = useState(false);

  const displayPlans = listCategoryDisplayPlans(category.plans);
  const subscribePlans = toPackageSubscribePlanOptions(displayPlans);
  const startingPriceCents = resolveCategoryStartingPriceCents(category.plans);
  const amount = formatAmdFromCents(startingPriceCents, locale);
  const { symbol, value } = formatPublicPackagePriceParts(amount);
  const showFromPrice = categoryHasMultiplePricedTiers(category.plans);
  const description = category.plans
    .map((plan) => plan.description?.trim())
    .find((item) => item !== undefined && item.length > 0) ?? null;
  const isPopular = category.plans.some((plan) => plan.isPopular);
  const categoryHref = buildPackageCategoryHref(category.id, audience);

  return (
    <li
      className={`ommm-card ommm-package-card-hover flex h-full min-h-0 flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8 ${
        isPopular ? "ring-2 ring-sand-400/70" : ""
      }`}
    >
      <div className="flex flex-1 flex-col">
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
              ? t("packagesPriceFromLine", { amount: value })
              : t("packagesPriceLine", { amount: value })}
          </p>
          <p className="mt-2 text-sm text-sage-500">
            {t("packagesCategoryTierCount", { count: displayPlans.length })}
          </p>
        </div>
        <ul className="mt-6 flex-1 space-y-4 border-t border-white/50 pt-6">
          {displayPlans.map((plan) => {
            const sessionsLabel = plan.isUnlimited
              ? t("packagesSessionsUnlimited")
              : t("packagesSessionsCount", { count: plan.sessionsPerMonth ?? 0 });
            const guestCount = plan.guestCount ?? 0;
            const tierPriceLine = formatPublicPackageTierPriceLine(
              plan.priceCents,
              locale,
              (values) => t("packagesPriceLine", values),
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
                  {t("packagesPeriodDaysShort", { days: plan.periodDays })}
                </p>
                <p className="mt-2 text-sm text-sage-600">{sessionsLabel}</p>
                {guestCount > 0 ? (
                  <p className="mt-1 text-sm text-sage-500">
                    {t("packagesGuestCount", { count: guestCount })}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <PackageCategoryCardFooter
        audience={audience}
        subscribeLabel={t("packagesSubscribeCta")}
        secondaryLabel={
          audience === "member" ? t("packagesViewAllCta") : t("packagesAccountCta")
        }
        secondaryHref={audience === "member" ? categoryHref : "/user/packages"}
        hint={audience === "member" ? t("packagesMemberHint") : t("packagesLoginHint")}
        onSubscribe={audience === "member" ? () => setPaymentOpen(true) : undefined}
      />
      {audience === "member" ? (
        <PackageSubscribePaymentModal
          isOpen={paymentOpen}
          locale={locale}
          plans={subscribePlans}
          onClose={() => setPaymentOpen(false)}
        />
      ) : null}
    </li>
  );
}
