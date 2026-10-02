"use client";

import type { FormEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  GIFT_SOFT_FIELD_CARD_CLASS,
  GiftRecipientPicker,
  type GiftRecipientOption,
} from "@/components/account/gift-recipient-picker";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { FORM_INVALID_FIELD_CLASS, FormErrorBanner } from "@/components/ui/form-validation";
import { GiftAmountChoices } from "@/components/account/gift-amount-choices";
import { CUSTOM_GIFT_MESSAGE_MAX_LENGTH } from "@/lib/custom-gift-card.constants";

export type CustomGiftFormProps = {
  amountId: string;
  messageId: string;
  amountRaw: string;
  message: string;
  recipient: GiftRecipientOption | null;
  error: string | null;
  amountError: string | null;
  recipientError: string | null;
  busy: boolean;
  minLabel: string;
  amountChoices: readonly { amountAmd: number; label: string }[];
  selectedAmountAmd: number | null;
  onAmountChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onRecipientChange: (value: GiftRecipientOption | null) => void;
  onSubmit: (event: FormEvent) => void;
  /** Gift type, then class fields when the gift is class sessions. */
  leading?: ReactNode;
  /** Money amount and ready-made denominations. Hidden for class gifts. */
  showAmount: boolean;
  extras?: ReactNode;
};

export function CustomGiftForm(props: CustomGiftFormProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  return (
    <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={props.onSubmit}>
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-7 sm:px-8 sm:py-8">
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
        <CustomGiftNote
          id={props.messageId}
          label={t("messageLabel")}
          placeholder={t("messagePlaceholder")}
          value={props.message}
          disabled={props.busy}
          onChange={props.onMessageChange}
        />
        <FormErrorBanner message={props.error} variant="inline" />
      </div>
      <div className="flex justify-end border-t border-sand-500/25 bg-white/95 px-5 py-4 sm:px-8">
        <OmmButton type="submit" variant="primary" disabled={props.busy} className="w-full sm:w-auto">
          {props.busy ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
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
    <div className={GIFT_SOFT_FIELD_CARD_CLASS}>
      <Field label={amountLabel} hint={amountHint} error={amountError} htmlFor={amountId}>
        <AmdMoneyInput
          id={amountId}
          value={amountRaw}
          disabled={busy}
          align="start"
          data-form-field="amount"
          aria-invalid={amountError !== null}
          aria-describedby={`${amountId}-hint`}
          className={`h-14 rounded-2xl text-lg font-medium tracking-tight text-sage-950 ${amountError !== null ? FORM_INVALID_FIELD_CLASS : ""}`}
          onValueChange={onAmountChange}
        />
      </Field>
      <GiftAmountChoices
        choices={amountChoices}
        selectedAmd={selectedAmountAmd}
        disabled={busy}
        onSelect={(amountAmd) => onAmountPick(String(amountAmd))}
      />
    </div>
  );
}

function CustomGiftNote({
  id,
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <label
        className="block font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900"
        htmlFor={id}
      >
        {label}
      </label>
      <div className={GIFT_SOFT_FIELD_CARD_CLASS}>
        <textarea
          id={id}
          rows={4}
          maxLength={CUSTOM_GIFT_MESSAGE_MAX_LENGTH}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          className="ommm-input min-h-32 resize-y rounded-2xl bg-white px-4 py-3 text-base"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint: string;
  error: string | null;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ommm-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      <p id={`${htmlFor}-hint`} className="text-xs leading-5 text-sage-500">
        {hint}
      </p>
      <FormErrorBanner message={error} variant="inline" />
    </div>
  );
}
