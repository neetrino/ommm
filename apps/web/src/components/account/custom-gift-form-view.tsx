"use client";

import type { FormEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  GiftRecipientPicker,
  type GiftRecipientOption,
} from "@/components/account/gift-recipient-picker";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { CUSTOM_GIFT_MESSAGE_MAX_LENGTH } from "@/lib/custom-gift-card.constants";

export type CustomGiftFormProps = {
  amountId: string;
  messageId: string;
  amountRaw: string;
  message: string;
  recipient: GiftRecipientOption | null;
  error: string | null;
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
      className="overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]"
      onSubmit={props.onSubmit}
    >
      <CustomGiftFace
        eyebrow={t("eyebrow")}
        title={t("title")}
        amountId={props.amountId}
        amountRaw={props.amountRaw}
        amountLabel={t("amountLabel")}
        amountHint={t("amountHint", { min: props.minLabel })}
        busy={props.busy}
        onAmountChange={props.onAmountChange}
      />
      <div className="space-y-6 px-5 py-6 sm:px-8">
        <GiftRecipientPicker
          embedded
          selected={props.recipient}
          disabled={props.busy}
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
        {props.error !== null ? (
          <p className="text-sm text-red-800" role="alert">
            {props.error}
          </p>
        ) : null}
      </div>
      <div className="flex justify-end border-t border-sand-100/90 bg-gradient-to-r from-white to-sand-50/80 px-5 py-4 sm:px-8">
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
  amountId,
  amountRaw,
  amountLabel,
  amountHint,
  busy,
  onAmountChange,
}: {
  eyebrow: string;
  title: string;
  amountId: string;
  amountRaw: string;
  amountLabel: string;
  amountHint: string;
  busy: boolean;
  onAmountChange: (value: string) => void;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-sand-100 via-white to-mint-100/80 px-5 py-7 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/55" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-mint-100/60" />
      <div className="relative max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-4xl font-normal leading-tight tracking-tight text-sage-900">
          {title}
        </h2>
        <div className="mt-7 max-w-sm rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_40px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md">
          <Field label={amountLabel} hint={amountHint} htmlFor={amountId}>
            <AmdMoneyInput
              id={amountId}
              value={amountRaw}
              disabled={busy}
              align="start"
              aria-describedby={`${amountId}-hint`}
              className="h-14 rounded-2xl text-lg font-medium tracking-tight text-sage-950"
              onValueChange={onAmountChange}
            />
          </Field>
        </div>
      </div>
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
    <label className="ommm-label flex flex-col gap-2" htmlFor={id}>
      {label}
      <textarea
        id={id}
        rows={4}
        maxLength={CUSTOM_GIFT_MESSAGE_MAX_LENGTH}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        className="ommm-input min-h-28 resize-y rounded-2xl"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint: string;
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
    </div>
  );
}
