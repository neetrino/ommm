import type { FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { CUSTOM_GIFT_CARD_MIN_AMD } from "@/lib/custom-gift-card.constants";
import {
  customGiftFieldIssues,
  startCustomGiftCheckout,
  type CustomGiftInputError,
} from "@/lib/custom-gift-checkout";
import type { CustomGiftDelivery, CustomGiftKind } from "@/components/account/custom-gift-options";
import type { GiftCardMedium } from "@/lib/gift-card-medium";
import { focusFormField } from "@/components/ui/form-validation";
import { openGiftCardPaymentPage } from "@/lib/arca-checkout";
import { giftDestinationIssue, giftDestinationPayload } from "@/lib/gift-recipient-email";
import { buildPaymentSuccessPath } from "@/lib/payment-result-paths";
import { parseAmdMoneyInput } from "@/lib/price-amd";

type ComposerCopy = {
  amountRequired: string;
  amountMin: string;
  amountMax: string;
  recipientRequired: string;
  phoneRequired: string;
};

type GiftErrorTranslator = {
  (key: "amountRequired" | "recipientRequired" | "phoneRequired"): string;
  (key: "amountMin", values: { min: string }): string;
  (key: "amountMax", values: { max: string }): string;
};

export function composerCopy(
  t: GiftErrorTranslator,
  minLabel: string,
  maxLabel: string,
): ComposerCopy {
  return {
    amountRequired: t("amountRequired"),
    amountMin: t("amountMin", { min: minLabel }),
    amountMax: t("amountMax", { max: maxLabel }),
    recipientRequired: t("recipientRequired"),
    phoneRequired: t("phoneRequired"),
  };
}

export async function submitCustomGift(
  event: FormEvent,
  input: {
    amountRaw: string;
    recipientEmail: string;
    recipientPhone: string;
    kind: CustomGiftKind;
    classTypeId: string;
    classSessions: string;
    classPackageId: string;
    delivery: CustomGiftDelivery;
    format: GiftCardMedium;
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
  const draft = readGiftDraft(input);
  input.setAmountError(draft.amountMessage);
  input.setRecipientError(draft.recipientMessage);
  if (draft.classMissing) {
    input.setError(input.classRequired);
    return;
  }
  if (draft.blocked) {
    focusMissingGiftField(
      event.currentTarget,
      draft.focusAmount ? "amount" : "recipient",
    );
    return;
  }
  await startGiftPayment(input, draft);
}

function readGiftDraft(input: {
  amountRaw: string;
  recipientEmail: string;
  recipientPhone: string;
  kind: CustomGiftKind;
  classTypeId: string;
  classSessions: string;
  classPackageId: string;
  delivery: CustomGiftDelivery;
  copy: ComposerCopy;
}) {
  const isClassGift = input.kind === "FIXED_CLASS";
  const amountAmd = isClassGift ? 0 : parseAmdMoneyInput(input.amountRaw);
  const sessions = Number.parseInt(input.classSessions, 10);
  const issues = customGiftFieldIssues(isClassGift ? CUSTOM_GIFT_CARD_MIN_AMD : amountAmd, true);
  const destination = giftDestinationIssue(input.delivery, input.recipientEmail, input.recipientPhone);
  const recipientMessage = recipientIssueText(destination, input.copy);
  const amountMessage = fieldIssueText(issues.amount, input.copy);
  const classMissing =
    isClassGift && !classGiftReady(input.classTypeId, input.classPackageId, sessions);
  const amountBlocked = !isClassGift && (amountMessage !== null || amountAmd === null);
  return {
    isClassGift,
    amountAmd,
    sessions,
    amountMessage,
    recipientMessage,
    classMissing,
    focusAmount: amountBlocked,
    blocked: classMissing || recipientMessage !== null || amountBlocked,
  };
}

async function startGiftPayment(
  input: {
    recipientEmail: string;
    recipientPhone: string;
    kind: CustomGiftKind;
    classTypeId: string;
    classPackageId: string;
    delivery: CustomGiftDelivery;
    format: GiftCardMedium;
    checkoutFailed: string;
    setError: (value: string | null) => void;
    setBusy: (value: boolean) => void;
    goToCheckout: (reference: string | null) => Promise<void>;
  },
  draft: {
    isClassGift: boolean;
    amountAmd: number | null;
    sessions: number;
  },
): Promise<void> {
  input.setBusy(true);
  input.setError(null);
  try {
    const started = await startCustomGiftCheckout({
      amountAmd: draft.amountAmd ?? 0,
      options: {
        ...giftDestinationPayload(input.delivery, input.recipientEmail, input.recipientPhone),
        type: input.kind,
        delivery: input.delivery,
        format: input.format,
        ...(draft.isClassGift
          ? {
              classTypeId: input.classTypeId,
              classQuantity: draft.sessions,
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

function fieldIssueText(
  reason: CustomGiftInputError | null,
  copy: ComposerCopy,
): string | null {
  if (reason === null || reason === "recipientRequired") {
    return null;
  }
  return customGiftErrorText(reason, copy);
}

function recipientIssueText(
  destination: "phone" | "email" | null,
  copy: ComposerCopy,
): string | null {
  if (destination === "phone") {
    return copy.phoneRequired;
  }
  if (destination === "email") {
    return copy.recipientRequired;
  }
  return null;
}

function classGiftReady(classTypeId: string, packagePlanId: string, sessions: number): boolean {
  return classTypeId.length > 0 && packagePlanId.length > 0 && Number.isFinite(sessions) && sessions >= 1;
}

function focusMissingGiftField(
  form: EventTarget | null,
  field: "amount" | "recipient",
): void {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  focusFormField(form, field);
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

export async function continueGiftToPayment(
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
