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
  onAmountChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onRecipientChange: (value: GiftRecipientOption | null) => void;
  onSubmit: (event: FormEvent) => void;
};

export function CustomGiftForm(props: CustomGiftFormProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  return (
    <form
      className="rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]"
      onSubmit={props.onSubmit}
    >
      <CustomGiftFace
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        amountId={props.amountId}
        amountRaw={props.amountRaw}
        amountLabel={t("amountLabel")}
        amountHint={t("amountHint", { min: props.minLabel })}
        amountError={props.amountError}
        busy={props.busy}
        onAmountChange={props.onAmountChange}
      />
      <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-8">
        <GiftRecipientPicker
          embedded
          selected={props.recipient}
          disabled={props.busy}
          validationMessage={props.recipientError}
          onSelect={props.onRecipientChange}
        />
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
      <div className="sticky bottom-0 z-20 flex justify-end rounded-b-[28px] border-t border-sand-500/25 bg-white/95 px-5 py-4 sm:px-8">
        <OmmButton type="submit" variant="primary" disabled={props.busy} className="w-full sm:w-auto">
          {props.busy ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
  );
}

function CustomGiftFace({
  eyebrow,
  title,
  lead,
  amountId,
  amountRaw,
  amountLabel,
  amountHint,
  amountError,
  busy,
  onAmountChange,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  amountId: string;
  amountRaw: string;
  amountLabel: string;
  amountHint: string;
  amountError: string | null;
  busy: boolean;
  onAmountChange: (value: string) => void;
}) {
  return (
    <div className="rounded-t-[28px] bg-gradient-to-br from-sand-100 via-peach-100/70 to-paper px-5 py-7 sm:px-8 sm:py-9">
      <div className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-4xl font-normal leading-tight tracking-tight text-sage-900">
          {title}
        </h2>
        <GiftLead text={lead} />
        <div className="mt-7 max-w-sm rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_40px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md">
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
        </div>
      </div>
    </div>
  );
}

function GiftLead({ text }: { text: string }) {
  return (
    <p className="mt-4 flex max-w-lg items-center gap-3">
      <span className="font-serif text-lg italic leading-relaxed text-sage-800 sm:text-xl">{text}</span>
      <GiftHeartIcon />
    </p>
  );
}

function GiftHeartIcon() {
  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-sand-700 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.45)]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </span>
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
