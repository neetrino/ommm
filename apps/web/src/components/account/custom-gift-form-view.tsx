"use client";

import type { FormEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  GiftRecipientPicker,
  type GiftRecipientOption,
} from "@/components/account/gift-recipient-picker";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { FORM_INVALID_FIELD_CLASS, FormErrorBanner } from "@/components/ui/form-validation";
import { GiftAmountChoices } from "@/components/account/gift-amount-choices";
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";

const PLAIN_LABEL_CLASS = "ommm-label text-xs uppercase tracking-wide";

export type CustomGiftFormProps = {
  amountId: string;
  amountRaw: string;
  recipient: GiftRecipientOption | null;
  error: string | null;
  amountError: string | null;
  recipientError: string | null;
  busy: boolean;
  minLabel: string;
  amountChoices: readonly { amountAmd: number; label: string }[];
  selectedAmountAmd: number | null;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: GiftRecipientOption | null) => void;
  onSubmit: (event: FormEvent) => void;
  /** Gift type, then class fields when the gift is class sessions. */
  leading?: ReactNode;
  /** Money amount and ready-made denominations. Hidden for class gifts. */
  showAmount: boolean;
  extras?: ReactNode;
  /** Class-gift total, shown above payment once a class type has a price. */
  priceCaption?: string;
  priceLabel?: string | null;
};

export function CustomGiftForm(props: CustomGiftFormProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  const tPage = useTranslations("userPages.giftCards");
  return (
    <form className="flex flex-col gap-5" onSubmit={props.onSubmit}>
      <GiftCardFace
        alt={tPage("cardImageAlt")}
        className="aspect-[1.58/1] overflow-hidden rounded-[22px]"
      />
      {props.leading}
      {props.showAmount ? (
        <CustomGiftAmount
          amountId={props.amountId}
          amountRaw={props.amountRaw}
          amountLabel={t("amountLabel")}
          amountHint={t("amountHint", { min: props.minLabel })}
          amountError={props.amountError}
          busy={props.busy}
          amountChoices={props.amountChoices}
          selectedAmountAmd={props.selectedAmountAmd}
          onAmountPick={props.onAmountChange}
          onAmountChange={props.onAmountChange}
        />
      ) : null}
      <GiftRecipientPicker
        embedded
        selected={props.recipient}
        disabled={props.busy}
        validationMessage={props.recipientError}
        onSelect={props.onRecipientChange}
      />
      {props.extras}
      <FormErrorBanner message={props.error} variant="inline" />
      <CustomGiftSubmitRow
        busy={props.busy}
        submitLabel={props.busy ? t("submitting") : t("submit")}
        priceCaption={props.priceCaption ?? t("priceLabel")}
        priceLabel={props.priceLabel ?? null}
      />
    </form>
  );
}

function CustomGiftSubmitRow({
  busy,
  submitLabel,
  priceCaption,
  priceLabel,
}: {
  busy: boolean;
  submitLabel: string;
  priceCaption: string;
  priceLabel: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sage-200/70 pt-4">
      {priceLabel !== null ? (
        <p className="flex items-baseline gap-3">
          <span className={PLAIN_LABEL_CLASS}>{priceCaption}</span>
          <span className="font-serif text-2xl leading-none text-sage-900">{priceLabel}</span>
        </p>
      ) : (
        <span />
      )}
      <OmmButton type="submit" variant="primary" size="md" disabled={busy}>
        {submitLabel}
      </OmmButton>
    </div>
  );
}

function CustomGiftAmount({
  amountId,
  amountRaw,
  amountLabel,
  amountHint,
  amountError,
  busy,
  amountChoices,
  selectedAmountAmd,
  onAmountPick,
  onAmountChange,
}: {
  amountId: string;
  amountRaw: string;
  amountLabel: string;
  amountHint: string;
  amountError: string | null;
  busy: boolean;
  amountChoices: readonly { amountAmd: number; label: string }[];
  selectedAmountAmd: number | null;
  onAmountPick: (amountAmd: string) => void;
  onAmountChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={PLAIN_LABEL_CLASS} htmlFor={amountId}>
        {amountLabel}
      </label>
      <AmdMoneyInput
        id={amountId}
        value={amountRaw}
        disabled={busy}
        align="start"
        data-form-field="amount"
        aria-invalid={amountError !== null}
        aria-describedby={`${amountId}-hint`}
        className={amountError !== null ? FORM_INVALID_FIELD_CLASS : ""}
        onValueChange={onAmountChange}
      />
      <p id={`${amountId}-hint`} className="text-xs text-sage-500">
        {amountHint}
      </p>
      <FormErrorBanner message={amountError} variant="inline" />
      <GiftAmountChoices
        choices={amountChoices}
        selectedAmd={selectedAmountAmd}
        disabled={busy}
        onSelect={(amountAmd) => onAmountPick(String(amountAmd))}
      />
    </div>
  );
}
