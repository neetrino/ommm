import { apiFetch } from "@/lib/api";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from "@/lib/custom-gift-card.constants";

type PendingPaymentResponse = {
  paymentReference: string | null;
};

export type CustomGiftInputError =
  | "amountRequired"
  | "amountMin"
  | "amountMax"
  | "recipientRequired";

export type CustomGiftFieldIssues = {
  amount: Exclude<CustomGiftInputError, "recipientRequired"> | null;
  recipient: "recipientRequired" | null;
};

/** Required-field issues only. The gift note is optional and is not checked. */
export function customGiftFieldIssues(
  amountAmd: number | null,
  hasRecipient: boolean,
): CustomGiftFieldIssues {
  return {
    amount: customGiftAmountIssue(amountAmd),
    recipient: hasRecipient ? null : "recipientRequired",
  };
}

export function customGiftInputError(
  amountAmd: number | null,
  hasRecipient: boolean,
): CustomGiftInputError | null {
  const issues = customGiftFieldIssues(amountAmd, hasRecipient);
  return issues.amount ?? issues.recipient;
}

function customGiftAmountIssue(
  amountAmd: number | null,
): CustomGiftFieldIssues["amount"] {
  if (amountAmd === null) {
    return "amountRequired";
  }
  if (amountAmd < CUSTOM_GIFT_CARD_MIN_AMD) {
    return "amountMin";
  }
  if (amountAmd > CUSTOM_GIFT_CARD_MAX_AMD) {
    return "amountMax";
  }
  return null;
}

/** Starts a pending custom-amount gift checkout and returns its reference. */
export async function startCustomGiftCheckout(input: {
  amountAmd: number;
  recipientId: string;
  message: string;
}): Promise<string | null> {
  const note = input.message.trim();
  const payment = await apiFetch<PendingPaymentResponse>("/payments/checkout/gift", {
    method: "POST",
    body: JSON.stringify({
      amountAmd: input.amountAmd,
      recipientId: input.recipientId,
      ...(note.length > 0 ? { message: note } : {}),
    }),
  });
  return payment.paymentReference;
}
