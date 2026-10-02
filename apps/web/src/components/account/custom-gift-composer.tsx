"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  CustomGiftForm,
} from "@/components/account/custom-gift-form-view";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from "@/lib/custom-gift-card.constants";
import {
  customGiftFieldIssues,
  floorCustomGiftAmountRaw,
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
import { openGiftCardPaymentPage } from "@/lib/arca-checkout";
import { isGiftRecipientEmail } from "@/lib/gift-recipient-email";
import { buildPaymentSuccessPath } from "@/lib/payment-result-paths";
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
  const [amountRaw, setAmountRaw] = useState(String(CUSTOM_GIFT_CARD_MIN_AMD));
  const [recipientEmail, setRecipientEmail] = useState("");
  const [kind, setKind] = useState<CustomGiftKind>("FIXED_VALUE");
  const [classTypeId, setClassTypeId] = useState("");
  const [classSessions, setClassSessions] = useState("1");
  const [classPackageId, setClassPackageId] = useState("");
  const [classPriceAmd, setClassPriceAmd] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<CustomGiftDelivery>("EMAIL");
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
      amountRaw={amountRaw}
      recipientEmail={recipientEmail}
      error={error}
      amountError={amountError}
      recipientError={recipientError}
      busy={busy}
      minLabel={minLabel}
      amountChoices={policy.choices}
      selectedAmountAmd={selectedAmountAmd}
      showAmount={kind === "FIXED_VALUE"}
      priceLabel={classPriceAmd === null ? null : formatAmdFromCents(classPriceAmd, locale)}
      leading={
        <CustomGiftKindSection
          kind={kind}
          classTypeId={classTypeId}
          classSessions={classSessions}
          delivery={delivery}
          disabled={busy}
          onKindChange={setKind}
          onClassTypeChange={setClassTypeId}
          onClassSessionsChange={setClassSessions}
          onPackagePlanChange={setClassPackageId}
          onQuotedPriceChange={setClassPriceAmd}
          onDeliveryChange={setDelivery}
          t={t}
        />
      }
      onAmountChange={(value) => {
        setAmountRaw(value);
        setAmountError(null);
      }}
      onRecipientEmailChange={(value) => {
        setRecipientEmail(value);
        setRecipientError(null);
      }}
      extras={
        <CustomGiftDeliverySection
          kind={kind}
          classTypeId={classTypeId}
          classSessions={classSessions}
          delivery={delivery}
          disabled={busy}
          onKindChange={setKind}
          onClassTypeChange={setClassTypeId}
          onClassSessionsChange={setClassSessions}
          onPackagePlanChange={setClassPackageId}
          onQuotedPriceChange={setClassPriceAmd}
          onDeliveryChange={setDelivery}
          t={t}
        />
      }
      onSubmit={(event) => {
        const giftAmountRaw = floorCustomGiftAmountRaw(amountRaw);
        if (giftAmountRaw !== amountRaw) {
          setAmountRaw(giftAmountRaw);
        }
        void submitComposer(event, {
          amountRaw: giftAmountRaw,
          recipientEmail,
          kind,
          classTypeId,
          classSessions,
          classPackageId,
          delivery,
          classRequired: t("classRequired"),
          checkoutFailed: t("checkoutFailed"),
          copy: composerCopy(t, minLabel, maxLabel),
          setError,
          setAmountError,
          setRecipientError,
          setBusy,
          goToCheckout: (reference) =>
            continueGiftToPayment(reference, locale, (href) => {
              router.push(href);
              router.refresh();
            }),
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

function classGiftReady(classTypeId: string, packagePlanId: string, sessions: number): boolean {
  return classTypeId.length > 0 && packagePlanId.length > 0 && Number.isFinite(sessions) && sessions >= 1;
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

async function continueGiftToPayment(
  reference: string | null,
  locale: string,
  goToSuccess: (href: string) => void,
): Promise<void> {
  if (reference === null) {
    throw new Error("Gift checkout is missing a payment reference");
  }
  const mode = await openGiftCardPaymentPage(reference, locale);
  if (mode === "simulated") {
    goToSuccess(buildPaymentSuccessPath(reference, "gift"));
  }
}

async function submitComposer(
  event: FormEvent,
  input: {
    amountRaw: string;
    recipientEmail: string;
    kind: CustomGiftKind;
    classTypeId: string;
    classSessions: string;
    classPackageId: string;
    delivery: CustomGiftDelivery;
    classRequired: string;
    checkoutFailed: string;
    copy: ComposerCopy;
    setError: (value: string | null) => void;
    setAmountError: (value: string | null) => void;
    setRecipientError: (value: string | null) => void;
    setBusy: (value: boolean) => void;
    goToCheckout: (reference: string | null) => Promise<void>;
  },
): Promise<void> {
  event.preventDefault();
  const isClassGift = input.kind === "FIXED_CLASS";
  const amountAmd = isClassGift ? 0 : parseAmdMoneyInput(input.amountRaw);
  const sessions = Number.parseInt(input.classSessions, 10);
  const issues = customGiftFieldIssues(
    isClassGift ? CUSTOM_GIFT_CARD_MIN_AMD : amountAmd,
    isGiftRecipientEmail(input.recipientEmail),
  );
  const amountMessage = fieldIssueText(issues.amount, input.copy);
  const recipientMessage = issues.recipient === null ? null : input.copy.recipientRequired;
  input.setAmountError(amountMessage);
  input.setRecipientError(recipientMessage);
  if (isClassGift && !classGiftReady(input.classTypeId, input.classPackageId, sessions)) {
    input.setError(input.classRequired);
    return;
  }
  if (recipientMessage !== null || (!isClassGift && (amountMessage !== null || amountAmd === null))) {
    focusMissingGiftField(event.currentTarget, !isClassGift && amountMessage !== null);
    return;
  }
  input.setBusy(true);
  input.setError(null);
  try {
    const started = await startCustomGiftCheckout({
      amountAmd: amountAmd ?? 0,
      options: {
        recipientEmail: input.recipientEmail.trim(),
        type: input.kind,
        delivery: input.delivery,
        ...(isClassGift
          ? {
              classTypeId: input.classTypeId,
              classQuantity: sessions,
              packagePlanId: input.classPackageId,
            }
          : {}),
      },
    });
    await input.goToCheckout(started.reference);
  } catch (err) {
    input.setError(err instanceof ApiError ? err.message : input.checkoutFailed);
    input.setBusy(false);
  }
}

