"use client";

import { useTranslations } from "next-intl";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import styles from "@/components/account/package-subscribe-plan-picker.module.css";
import {
  formatPublicPackageTierSessionsHeadline,
  formatPublicPackageValidityLabel,
} from "@/components/marketing/packages/public-package-tier-display";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";
import { formatAmdFromCents } from "@/lib/price-amd";

type PackageSubscribePlanPickerProps = {
  plans: readonly PackageSubscribePlanOption[];
  selectedPlanId: string;
  locale: string;
  onSelect: (planId: string) => void;
};

export function PackageSubscribePlanPicker({
  plans,
  selectedPlanId,
  locale,
  onSelect,
}: PackageSubscribePlanPickerProps) {
  const t = useTranslations("forms.manualPackagePayment");
  const tMarketing = useTranslations("marketing");

  if (plans.length <= 1) {
    const plan = plans[0];
    if (plan === undefined) {
      return null;
    }
    return (
      <div className={styles.packageSubscribePlanPicker}>
        <p
          className={`ommm-label text-xs uppercase tracking-wide text-sage-700 ${styles.packageSubscribePlanPickerLegend}`}
        >
          {t("selectPlanLegend")}
        </p>
        <div className={styles.packageSubscribePlanPickerCards}>
          <PackageSubscribePlanSummary plan={plan} locale={locale} />
        </div>
      </div>
    );
  }

  return (
    <fieldset className={styles.packageSubscribePlanPicker}>
      <legend
        className={`ommm-label text-xs uppercase tracking-wide text-sage-700 ${styles.packageSubscribePlanPickerLegend}`}
      >
        {t("selectPlanLegend")}
      </legend>
      <div className={styles.packageSubscribePlanPickerCards}>
      {plans.map((plan) => {
        const isSelected = plan.id === selectedPlanId;
        const sessionName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
        const sessionsLabel = formatPublicPackageTierSessionsHeadline(plan, {
          unlimited: t("unlimitedClasses"),
          count: (values) => tMarketing("packagesTierSessionsLabel", values),
        });
        const validityLabel = formatPublicPackageValidityLabel(plan, {
          days: (count) => tMarketing("packagesValidityDays", { count }),
          months: (count) => tMarketing("packagesValidityMonths", { count }),
        });

        return (
          <button
            key={plan.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`${styles.packageSubscribePlanOption} ${
              isSelected ? styles.packageSubscribePlanOptionSelected : ""
            }`}
            onClick={() => onSelect(plan.id)}
          >
            <span className={styles.packageSubscribePlanOptionHeader}>
              <span className={styles.packageSubscribePlanOptionTitle}>{sessionName}</span>
              <span className={styles.packageSubscribePlanOptionPrice}>
                {plan.discountedPriceCents !== null &&
                plan.discountedPriceCents < plan.priceCents ? (
                  <span className="flex flex-col items-end">
                    <span className="text-xs font-medium text-sage-500 line-through">
                      {formatAmdFromCents(plan.priceCents, locale)}
                    </span>
                    <span className="text-sand-800">
                      {formatAmdFromCents(plan.finalPriceCents, locale)}
                    </span>
                  </span>
                ) : (
                  formatAmdFromCents(plan.priceCents, locale)
                )}
              </span>
            </span>
            <span className={styles.packageSubscribePlanOptionMeta}>
              {sessionsLabel}
              {validityLabel !== null ? ` · ${validityLabel}` : null}
            </span>
            {isSelected ? (
              <span className={styles.packageSubscribePlanOptionBadge}>{t("selectedPlanBadge")}</span>
            ) : null}
          </button>
        );
      })}
      </div>
    </fieldset>
  );
}

type PackageSubscribePlanSummaryProps = {
  plan: PackageSubscribePlanOption;
  locale: string;
};

function PackageSubscribePlanSummary({ plan, locale }: PackageSubscribePlanSummaryProps) {
  const t = useTranslations("forms.manualPackagePayment");
  const sessionName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
  const sessionsLabel = plan.isUnlimited
    ? t("unlimitedClasses")
    : t("sessionsPerPeriod", { count: plan.sessionsPerMonth ?? 0 });

  return (
    <div className={styles.packageSubscribePlanSummary}>
      <p className="text-sm font-medium text-sage-800">{sessionName}</p>
      <p className="mt-1 text-sm font-semibold text-sage-700">
        {formatAmdFromCents(plan.finalPriceCents, locale)}
      </p>
      <p className="mt-1 text-sm text-sage-500">
        {t("periodDays", { days: plan.periodDays })} · {sessionsLabel}
      </p>
    </div>
  );
}
