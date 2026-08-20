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

function GiftCreditsIcon() {
  return (
    <svg
      className={formStyles.giftCreditsIcon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 7v14M12 7H8.5A2.5 2.5 0 0 1 8.5 2C10.5 2 12 7 12 7ZM12 7h3.5A2.5 2.5 0 0 0 15.5 2C13.5 2 12 7 12 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 11h15v7.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 11V9.5A1.5 1.5 0 0 1 6 8h12a1.5 1.5 0 0 1 1.5 1.5V11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const hasCredit = spendableCents > 0;
  const blockClassName = [
    formStyles.giftCreditsBlock,
    checked ? formStyles.giftCreditsBlockActive : "",
    !hasCredit ? formStyles.giftCreditsBlockEmpty : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={formStyles.giftCreditsSection} aria-labelledby={`${fieldId}-legend`}>
      <p
        id={`${fieldId}-legend`}
        className={`ommm-label text-xs uppercase tracking-wide text-sage-700 ${formStyles.sectionHeading}`}
      >
        {t("giftCreditsLegend")}
      </p>

      <div className={blockClassName}>
        <label
          htmlFor={fieldId}
          className={`${formStyles.giftCreditsOption} ${disabled ? formStyles.giftCreditsOptionDisabled : ""}`}
        >
          <span className={formStyles.giftCreditsIconWrap} aria-hidden>
            <GiftCreditsIcon />
          </span>

          <span className={formStyles.giftCreditsCopy}>
            <span className={formStyles.giftCreditsTitleRow}>
              <span className={formStyles.giftCreditsTitle}>{t("useGiftCredits")}</span>
              {hasCredit ? (
                <span className={formStyles.giftCreditsBadge}>
                  {formatAmdFromCents(spendableCents, locale)}
                </span>
              ) : null}
            </span>
            <span className={formStyles.giftCreditsHint}>
              {hasCredit
                ? t("giftCreditsAvailableHint")
                : t("giftCreditsUnavailable")}
            </span>
          </span>

          <input
            id={fieldId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            className={formStyles.giftCreditsCheckbox}
          />
        </label>

        {checked && hasCredit ? (
          <dl className={formStyles.giftCreditsSummary}>
            <div className={formStyles.giftCreditsSummaryRow}>
              <dt>{t("giftCreditsApplied")}</dt>
              <dd className={formStyles.giftCreditsAppliedValue}>
                −{formatAmdFromCents(appliedCents, locale)}
              </dd>
            </div>
            <div className={formStyles.giftCreditsSummaryRow}>
              <dt>{t("amountDue")}</dt>
              <dd className={formStyles.giftCreditsDueValue}>
                {formatAmdFromCents(amountDueCents, locale)}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  );
}
