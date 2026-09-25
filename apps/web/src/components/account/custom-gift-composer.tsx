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

