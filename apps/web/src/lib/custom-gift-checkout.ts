import { apiFetch } from "@/lib/api";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from "@/lib/custom-gift-card.constants";
import { parseAmdMoneyInput } from "@/lib/price-amd";

type PendingPaymentResponse = {
  paymentReference: string | null;
  amountCents?: number;
};

export type GiftCheckoutOptions = {
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  type?: "FIXED_VALUE" | "FIXED_CLASS";
  classTypeId?: string;
  classQuantity?: number;
  packagePlanId?: string;
  delivery?: "EMAIL" | "WHATSAPP" | "PRINT";
  deliverAt?: string;
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

/** Required-field issues. The recipient email is required; a personal note is not. */
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

/** True when the typed amount is present and under the 30,000 AMD floor. */
export function customGiftAmountBelowMin(raw: string): boolean {
  const parsed = parseAmdMoneyInput(raw);
  return parsed !== null && parsed < CUSTOM_GIFT_CARD_MIN_AMD;
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
  message?: string;
  options: GiftCheckoutOptions;
}): Promise<{ reference: string | null; amountCents: number }> {
  const note = input.message?.trim() ?? "";
  const payment = await apiFetch<PendingPaymentResponse>("/payments/checkout/gift", {
    method: "POST",
    body: JSON.stringify({
      ...(input.options.type === "FIXED_CLASS" ? {} : { amountAmd: input.amountAmd }),
      ...(note.length > 0 ? { message: note } : {}),
      ...input.options,
    }),
  });
  return {
    reference: payment.paymentReference,
    amountCents: payment.amountCents ?? input.amountAmd,
  };
}
