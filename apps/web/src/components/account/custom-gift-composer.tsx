"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  GiftRecipientPicker,
  type GiftRecipientOption,
} from "@/components/account/gift-recipient-picker";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
  CUSTOM_GIFT_MESSAGE_MAX_LENGTH,
} from "@/lib/custom-gift-card.constants";
import {
  customGiftInputError,
  startCustomGiftCheckout,
  type CustomGiftInputError,
} from "@/lib/custom-gift-checkout";
import { GIFT_CARD_CHECKOUT_PATH } from "@/lib/payment-checkout-source";
import { formatAmdFromCents, parseAmdMoneyInput } from "@/lib/price-amd";

type CustomGiftComposerProps = {
  locale: string;
};

type ComposerCopy = {
  amountRequired: string;
  amountMin: string;
  amountMax: string;
  recipientRequired: string;
};

export function CustomGiftComposer({ locale }: CustomGiftComposerProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  const router = useRouter();
  const amountId = useId();
  const messageId = useId();
  const [amountRaw, setAmountRaw] = useState(String(CUSTOM_GIFT_CARD_MIN_AMD));
  const [recipient, setRecipient] = useState<GiftRecipientOption | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const minLabel = formatAmdFromCents(CUSTOM_GIFT_CARD_MIN_AMD, locale);
  const maxLabel = formatAmdFromCents(CUSTOM_GIFT_CARD_MAX_AMD, locale);

  return (
    <CustomGiftForm
      amountId={amountId}
      messageId={messageId}
      amountRaw={amountRaw}
      message={message}
      recipient={recipient}
      error={error}
      busy={busy}
      minLabel={minLabel}
      lead={t("lead", { min: minLabel })}
      onAmountChange={setAmountRaw}
      onMessageChange={setMessage}
      onRecipientChange={(value) => {
        setRecipient(value);
        setError(null);
      }}
      onSubmit={(event) => {
        void submitComposer(event, {
          amountRaw,
          recipient,
          message,
          checkoutFailed: t("checkoutFailed"),
          copy: composerCopy(t, minLabel, maxLabel),
          setError,
          setBusy,
          goToCheckout: (amountAmd, reference) => {
            router.push(giftCheckoutHref(amountAmd, reference));
          },
        });
      }}
    />
  );
}

function customGiftErrorText(reason: CustomGiftInputError, copy: ComposerCopy): string {
  if (reason === "amountMin") {
    return copy.amountMin;
  }
  if (reason === "amountMax") {
    return copy.amountMax;
  }
  if (reason === "recipientRequired") {
    return copy.recipientRequired;
  }
  return copy.amountRequired;
}

type GiftErrorTranslator = {
  (key: "amountRequired" | "recipientRequired"): string;
  (key: "amountMin", values: { min: string }): string;
  (key: "amountMax", values: { max: string }): string;
};

function composerCopy(
  t: GiftErrorTranslator,
  minLabel: string,
  maxLabel: string,
): ComposerCopy {
  return {
    amountRequired: t("amountRequired"),
    amountMin: t("amountMin", { min: minLabel }),
    amountMax: t("amountMax", { max: maxLabel }),
    recipientRequired: t("recipientRequired"),
  };
}

function giftCheckoutHref(amountAmd: number, reference: string | null): string {
  const params = new URLSearchParams({ amountCents: String(amountAmd) });
  if (reference) {
    params.set("reference", reference);
  }
  return `${GIFT_CARD_CHECKOUT_PATH}?${params.toString()}`;
}

async function submitComposer(
  event: FormEvent,
  input: {
    amountRaw: string;
    recipient: GiftRecipientOption | null;
    message: string;
    checkoutFailed: string;
    copy: ComposerCopy;
    setError: (value: string | null) => void;
    setBusy: (value: boolean) => void;
    goToCheckout: (amountAmd: number, reference: string | null) => void;
  },
): Promise<void> {
  event.preventDefault();
  const amountAmd = parseAmdMoneyInput(input.amountRaw);
  const reason = customGiftInputError(amountAmd, input.recipient !== null);
  if (reason !== null || amountAmd === null || input.recipient === null) {
    const fallback = input.copy.amountRequired;
    input.setError(reason === null ? fallback : customGiftErrorText(reason, input.copy));
    return;
  }
  input.setBusy(true);
  input.setError(null);
  try {
    const reference = await startCustomGiftCheckout({
      amountAmd,
      recipientId: input.recipient.id,
      message: input.message,
    });
    input.goToCheckout(amountAmd, reference);
  } catch (err) {
    input.setError(err instanceof ApiError ? err.message : input.checkoutFailed);
    input.setBusy(false);
  }
}

type CustomGiftFormProps = {
  amountId: string;
  messageId: string;
  amountRaw: string;
  message: string;
  recipient: GiftRecipientOption | null;
  error: string | null;
  busy: boolean;
  minLabel: string;
  lead: string;
  onAmountChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onRecipientChange: (value: GiftRecipientOption | null) => void;
  onSubmit: (event: FormEvent) => void;
};

function CustomGiftForm(props: CustomGiftFormProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  return (
    <form
      className="overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]"
      onSubmit={props.onSubmit}
    >
      <CustomGiftHero eyebrow={t("eyebrow")} title={t("title")} lead={props.lead} />
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <CustomGiftAmountField
          id={props.amountId}
          value={props.amountRaw}
          hint={t("amountHint", { min: props.minLabel })}
          label={t("amountLabel")}
          disabled={props.busy}
          onValueChange={props.onAmountChange}
        />
        <GiftRecipientPicker
          selected={props.recipient}
          disabled={props.busy}
          onSelect={props.onRecipientChange}
        />
        <label className="ommm-label flex flex-col gap-2" htmlFor={props.messageId}>
          {t("messageLabel")}
          <textarea
            id={props.messageId}
            rows={3}
            maxLength={CUSTOM_GIFT_MESSAGE_MAX_LENGTH}
            disabled={props.busy}
            value={props.message}
            placeholder={t("messagePlaceholder")}
            className="ommm-input min-h-24 resize-y"
            onChange={(event) => props.onMessageChange(event.target.value)}
          />
        </label>
        {props.error !== null ? (
          <p className="text-sm text-red-800" role="alert">
            {props.error}
          </p>
        ) : null}
        <div className="flex justify-end">
          <OmmButton type="submit" variant="primary" disabled={props.busy}>
            {props.busy ? t("submitting") : t("submit")}
          </OmmButton>
        </div>
      </div>
    </form>
  );
}

function CustomGiftHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="bg-gradient-to-br from-sand-100 via-white to-mint-100 px-5 py-6 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-500">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-2xl font-normal tracking-tight text-sage-900">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-sage-600">{lead}</p>
    </div>
  );
}

function CustomGiftAmountField({
  id,
  value,
  label,
  hint,
  disabled,
  onValueChange,
}: {
  id: string;
  value: string;
  label: string;
  hint: string;
  disabled: boolean;
  onValueChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <AmdMoneyInput
        id={id}
        value={value}
        disabled={disabled}
        align="start"
        aria-describedby={`${id}-hint`}
        onValueChange={onValueChange}
      />
    </Field>
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
      <p id={`${htmlFor}-hint`} className="text-xs text-sage-500">
        {hint}
      </p>
    </div>
  );
}
