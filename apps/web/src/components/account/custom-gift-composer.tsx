"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  CustomGiftForm,
} from "@/components/account/custom-gift-form-view";
import type { GiftRecipientOption } from "@/components/account/gift-recipient-picker";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from "@/lib/custom-gift-card.constants";
import {
  customGiftFieldIssues,
  startCustomGiftCheckout,
  type CustomGiftInputError,
} from "@/lib/custom-gift-checkout";
import {
  CustomGiftDeliverySection,
  CustomGiftKindSection,
  type CustomGiftDelivery,
  type CustomGiftKind,
} from "@/components/account/custom-gift-options";
import { useGiftAmountPolicy } from "@/components/account/use-gift-amount-policy";
import { focusFormField } from "@/components/ui/form-validation";
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
  const [kind, setKind] = useState<CustomGiftKind>("FIXED_VALUE");
  const [classTypeId, setClassTypeId] = useState("");
  const [classSessions, setClassSessions] = useState("1");
  const [delivery, setDelivery] = useState<CustomGiftDelivery>("EMAIL");
  const [deliverAt, setDeliverAt] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const policy = useGiftAmountPolicy(locale);
  const minLabel = formatAmdFromCents(policy.minAmd, locale);
  const maxLabel = formatAmdFromCents(CUSTOM_GIFT_CARD_MAX_AMD, locale);
  const selectedAmountAmd = parseAmdMoneyInput(amountRaw);

  return (
    <CustomGiftForm
      amountId={amountId}
      messageId={messageId}
      amountRaw={amountRaw}
      message={message}
      recipient={recipient}
      error={error}
      amountError={amountError}
      recipientError={recipientError}
      busy={busy}
      minLabel={minLabel}
      amountChoices={policy.choices}
      selectedAmountAmd={selectedAmountAmd}
      showAmount={kind === "FIXED_VALUE"}
      leading={
        <CustomGiftKindSection
          kind={kind}
          classTypeId={classTypeId}
          classSessions={classSessions}
          delivery={delivery}
          deliverAt={deliverAt}
          guestName={guestName}
          guestEmail={guestEmail}
          disabled={busy}
          onKindChange={setKind}
          onClassTypeChange={setClassTypeId}
          onClassSessionsChange={setClassSessions}
          onDeliveryChange={setDelivery}
          onDeliverAtChange={setDeliverAt}
          onGuestNameChange={setGuestName}
          onGuestEmailChange={setGuestEmail}
          t={t}
        />
      }
      onAmountChange={(value) => {
        setAmountRaw(value);
        setAmountError(null);
      }}
      onMessageChange={setMessage}
      onRecipientChange={(value) => {
        setRecipient(value);
        setRecipientError(null);
      }}
      extras={
        <CustomGiftDeliverySection
          kind={kind}
          classTypeId={classTypeId}
          classSessions={classSessions}
          delivery={delivery}
          deliverAt={deliverAt}
          guestName={guestName}
          guestEmail={guestEmail}
          disabled={busy}
          onKindChange={setKind}
          onClassTypeChange={setClassTypeId}
          onClassSessionsChange={setClassSessions}
          onDeliveryChange={setDelivery}
          onDeliverAtChange={setDeliverAt}
          onGuestNameChange={setGuestName}
          onGuestEmailChange={setGuestEmail}
          t={t}
        />
      }
      onSubmit={(event) => {
        void submitComposer(event, {
          amountRaw,
          recipient,
          message,
          kind,
          classTypeId,
          classSessions,
          delivery,
          deliverAt,
          guestName,
          guestEmail,
          classRequired: t("classRequired"),
          checkoutFailed: t("checkoutFailed"),
          copy: composerCopy(t, minLabel, maxLabel),
          setError,
          setAmountError,
          setRecipientError,
          setBusy,
          goToCheckout: (amountAmd, reference) => {
            router.push(giftCheckoutHref(amountAmd, reference));
          },
        });
      }}
    />
  );
}

function fieldIssueText(
  reason: CustomGiftInputError | null,
  copy: ComposerCopy,
): string | null {
  if (reason === null || reason === "recipientRequired") {
    return null;
  }
  return customGiftErrorText(reason, copy);
}

function focusMissingGiftField(form: EventTarget | null, amountMissing: boolean): void {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  focusFormField(form, amountMissing ? "amount" : "recipient");
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
    kind: CustomGiftKind;
    classTypeId: string;
    classSessions: string;
    delivery: CustomGiftDelivery;
    deliverAt: string;
    guestName: string;
    guestEmail: string;
    classRequired: string;
    checkoutFailed: string;
    copy: ComposerCopy;
    setError: (value: string | null) => void;
    setAmountError: (value: string | null) => void;
    setRecipientError: (value: string | null) => void;
    setBusy: (value: boolean) => void;
    goToCheckout: (amountAmd: number, reference: string | null) => void;
  },
): Promise<void> {
  event.preventDefault();
  const isClassGift = input.kind === "FIXED_CLASS";
  const amountAmd = isClassGift ? 0 : parseAmdMoneyInput(input.amountRaw);
  const sessions = Number.parseInt(input.classSessions, 10);
  const recipient = input.recipient;
  const issues = customGiftFieldIssues(
    isClassGift ? CUSTOM_GIFT_CARD_MIN_AMD : amountAmd,
    recipient !== null,
  );
  const amountMessage = fieldIssueText(issues.amount, input.copy);
  const recipientMessage = issues.recipient === null ? null : input.copy.recipientRequired;
  input.setAmountError(amountMessage);
  input.setRecipientError(recipientMessage);
  if (isClassGift && (input.classTypeId.length === 0 || !Number.isFinite(sessions) || sessions < 1)) {
    input.setError(input.classRequired);
    return;
  }
  if (!isClassGift && (amountMessage !== null || recipientMessage !== null || amountAmd === null)) {
    focusMissingGiftField(event.currentTarget, amountMessage !== null);
    return;
  }
  input.setBusy(true);
  input.setError(null);
  try {
    const started = await startCustomGiftCheckout({
      amountAmd: amountAmd ?? 0,
      message: input.message,
      options: {
        ...(recipient ? { recipientId: recipient.id } : {}),
        ...(input.guestName.trim() ? { recipientName: input.guestName.trim() } : {}),
        ...(input.guestEmail.trim() ? { recipientEmail: input.guestEmail.trim() } : {}),
        type: input.kind,
        delivery: input.delivery,
        ...(isClassGift ? { classTypeId: input.classTypeId, classQuantity: sessions } : {}),
        ...(input.deliverAt ? { deliverAt: `${input.deliverAt}T12:00:00.000Z` } : {}),
      },
    });
    input.goToCheckout(started.amountCents, started.reference);
  } catch (err) {
    input.setError(err instanceof ApiError ? err.message : input.checkoutFailed);
    input.setBusy(false);
  }
}

