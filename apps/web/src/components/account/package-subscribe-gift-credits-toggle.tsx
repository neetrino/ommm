"use client";

import { useTranslations } from "next-intl";
import formStyles from "@/components/account/package-subscribe-payment-form.module.css";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  remainingGiftCents,
  selectedGiftBalanceCents,
  type SpendableGiftCardChoice,
} from "@/lib/spendable-gift-card-choices";

type PackageSubscribeGiftCreditsToggleProps = {
  fieldId: string;
  checked: boolean;
  disabled: boolean;
  spendableCents: number;
  appliedCents: number;
  amountDueCents: number;
  locale: string;
  cards: readonly SpendableGiftCardChoice[];
  selectedIds: readonly string[];
  onChange: (value: boolean) => void;
  onSelectedIdsChange: (ids: string[]) => void;
};

function GiftCardChoiceList({
  cards,
  selectedIds,
  disabled,
  locale,
  hint,
  selectAllLabel,
  onSelectedIdsChange,
}: {
  cards: readonly SpendableGiftCardChoice[];
  selectedIds: readonly string[];
  disabled: boolean;
  locale: string;
  hint: string;
  selectAllLabel: string;
  onSelectedIdsChange: (ids: string[]) => void;
}) {
  const selected = new Set(selectedIds);
  return (
    <div className="space-y-2">
      <GiftCardSelectAll
        hint={hint}
        label={selectAllLabel}
        disabled={disabled || cards.every((card) => selected.has(card.id))}
        onSelect={() => onSelectedIdsChange(cards.map((card) => card.id))}
      />
      <ul className={formStyles.giftCardChoices}>
        {cards.map((card) => (
          <li key={card.id}>
            <label className={formStyles.giftCardChoice}>
              <span className={formStyles.giftCardChoiceCode}>{card.code}</span>
              <span className={formStyles.giftCreditsBadge}>
                {formatAmdFromCents(card.balanceCents, locale)}
              </span>
              <input
                type="checkbox"
                className={formStyles.giftCreditsCheckbox}
                checked={selected.has(card.id)}
                disabled={disabled}
                onChange={(event) =>
                  onSelectedIdsChange(toggleGiftCardId(selectedIds, card.id, event.target.checked))
                }
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GiftCardSelectAll({
  hint,
  label,
  disabled,
  onSelect,
}: {
  hint: string;
  label: string;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={formStyles.giftCardChoiceHeader}>
      <p className={formStyles.giftCreditsHint}>{hint}</p>
      <button
        type="button"
        className={formStyles.giftCardSelectAll}
        disabled={disabled}
        onClick={onSelect}
      >
        {label}
      </button>
    </div>
  );
}

function toggleGiftCardId(
  selectedIds: readonly string[],
  cardId: string,
  checked: boolean,
): string[] {
  if (!checked) {
    return selectedIds.filter((id) => id !== cardId);
  }
  return selectedIds.includes(cardId) ? [...selectedIds] : [...selectedIds, cardId];
}

function PooledGiftCreditOption({
  fieldId,
  checked,
  disabled,
  hasCredit,
  spendableCents,
  locale,
  title,
  availableHint,
  unavailableHint,
  onChange,
}: {
  fieldId: string;
  checked: boolean;
  disabled: boolean;
  hasCredit: boolean;
  spendableCents: number;
  locale: string;
  title: string;
  availableHint: string;
  unavailableHint: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={fieldId}
      className={`${formStyles.giftCreditsOption} ${disabled ? formStyles.giftCreditsOptionDisabled : ""}`}
    >
      <span className={formStyles.giftCreditsIconWrap} aria-hidden>
        <GiftCreditsIcon />
      </span>
      <span className={formStyles.giftCreditsCopy}>
        <span className={formStyles.giftCreditsTitleRow}>
          <span className={formStyles.giftCreditsTitle}>{title}</span>
          {hasCredit ? (
            <span className={formStyles.giftCreditsBadge}>
              {formatAmdFromCents(spendableCents, locale)}
            </span>
          ) : null}
        </span>
        <span className={formStyles.giftCreditsHint}>
          {hasCredit ? availableHint : unavailableHint}
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
  );
}

function GiftCreditSummary({
  appliedLabel,
  dueLabel,
  remainderLabel,
  appliedCents,
  amountDueCents,
  remainderCents,
  locale,
}: {
  appliedLabel: string;
  dueLabel: string;
  remainderLabel: string;
  appliedCents: number;
  amountDueCents: number;
  remainderCents: number;
  locale: string;
}) {
  return (
    <dl className={formStyles.giftCreditsSummary}>
      <div className={formStyles.giftCreditsSummaryRow}>
        <dt>{appliedLabel}</dt>
        <dd className={formStyles.giftCreditsAppliedValue}>
          −{formatAmdFromCents(appliedCents, locale)}
        </dd>
      </div>
      {remainderCents > 0 ? (
        <div className={formStyles.giftCreditsSummaryRow}>
          <dt>{remainderLabel}</dt>
          <dd className={formStyles.giftCreditsDueValue}>
            {formatAmdFromCents(remainderCents, locale)}
          </dd>
        </div>
      ) : null}
      <div className={formStyles.giftCreditsSummaryRow}>
        <dt>{dueLabel}</dt>
        <dd className={formStyles.giftCreditsDueValue}>
          {formatAmdFromCents(amountDueCents, locale)}
        </dd>
      </div>
    </dl>
  );
}

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
  cards,
  selectedIds,
  onChange,
  onSelectedIdsChange,
}: PackageSubscribeGiftCreditsToggleProps) {
  const t = useTranslations("forms.manualPackagePayment");
  const choosingCards = cards.length > 0;
  const hasCredit = choosingCards || spendableCents > 0;
  const selectionActive = choosingCards ? selectedIds.length > 0 : checked;
  const blockClassName = [
    formStyles.giftCreditsBlock,
    selectionActive ? formStyles.giftCreditsBlockActive : "",
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
        {choosingCards ? (
          <GiftCardChoiceList
            cards={cards}
            selectedIds={selectedIds}
            disabled={disabled}
            locale={locale}
            hint={t("giftCardChooseHint")}
            selectAllLabel={t("giftCardSelectAll")}
            onSelectedIdsChange={onSelectedIdsChange}
          />
        ) : (
          <PooledGiftCreditOption
            fieldId={fieldId}
            checked={checked}
            disabled={disabled}
            hasCredit={hasCredit}
            spendableCents={spendableCents}
            locale={locale}
            title={t("useGiftCredits")}
            availableHint={t("giftCreditsAvailableHint")}
            unavailableHint={t("giftCreditsUnavailable")}
            onChange={onChange}
          />
        )}

        {selectionActive && hasCredit ? (
          <GiftCreditSummary
            appliedLabel={t("giftCreditsApplied")}
            dueLabel={t("amountDue")}
            remainderLabel={t("giftCardRemainder")}
            appliedCents={appliedCents}
            amountDueCents={amountDueCents}
            remainderCents={remainingGiftCents(
              choosingCards
                ? selectedGiftBalanceCents(cards, selectedIds)
                : spendableCents,
              appliedCents,
            )}
            locale={locale}
          />
        ) : null}
      </div>
    </section>
  );
}
