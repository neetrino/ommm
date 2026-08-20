"use client";

import { useTranslations } from "next-intl";
import formStyles from "@/components/account/package-subscribe-payment-form.module.css";
import { formatAmdFromCents } from "@/lib/price-amd";

type PackageSubscribeGiftCreditsToggleProps = {
  fieldId: string;
  checked: boolean;
  disabled: boolean;
  spendableCents: number;
  appliedCents: number;
  amountDueCents: number;
  locale: string;
  onChange: (value: boolean) => void;
};

/** Opt-in control to apply spendable gift credit toward a package purchase. */
export function PackageSubscribeGiftCreditsToggle({
  fieldId,
  checked,
  disabled,
  spendableCents,
  appliedCents,
  amountDueCents,
  locale,
  onChange,
}: PackageSubscribeGiftCreditsToggleProps) {
  const t = useTranslations("forms.manualPackagePayment");

  return (
    <div className={formStyles.giftCreditsBlock}>
      <label htmlFor={fieldId} className={formStyles.giftCreditsOption}>
        <input
          id={fieldId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className={formStyles.giftCreditsCheckbox}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-sage-900">
            {t("useGiftCredits")}
          </span>
          <span className="mt-0.5 block text-xs text-sage-500">
            {spendableCents > 0
              ? t("giftCreditsAvailable", {
                  amount: formatAmdFromCents(spendableCents, locale),
                })
              : t("giftCreditsUnavailable")}
          </span>
        </span>
      </label>
      {checked ? (
        <dl className={formStyles.giftCreditsSummary}>
          <div className={formStyles.giftCreditsSummaryRow}>
            <dt>{t("giftCreditsApplied")}</dt>
            <dd>−{formatAmdFromCents(appliedCents, locale)}</dd>
          </div>
          <div className={formStyles.giftCreditsSummaryRow}>
            <dt>{t("amountDue")}</dt>
            <dd>{formatAmdFromCents(amountDueCents, locale)}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
