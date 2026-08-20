import { MARKETING_SCHEDULE_PATH } from "@/lib/auth-redirect";

export const PAYMENT_CHECKOUT_SOURCES = ["gift", "dropin", "package", "other"] as const;

export type PaymentCheckoutSource = (typeof PAYMENT_CHECKOUT_SOURCES)[number];

/** Gift card Pay flow stays under Gift Cards — not the Payments hub. */
export const GIFT_CARD_CHECKOUT_PATH = "/user/gift-cards/checkout";

export const MEMBER_PAYMENT_CHECKOUT_PATH = "/user/payments/checkout";

export function parsePaymentCheckoutSource(
  value: string | undefined,
): PaymentCheckoutSource {
  if (value === "gift" || value === "dropin" || value === "package") {
    return value;
  }
  return "other";
}

/** Browser path for the pending-payment checkout UI for a given source. */
export function paymentCheckoutPath(source: PaymentCheckoutSource): string {
  if (source === "gift") {
    return GIFT_CARD_CHECKOUT_PATH;
  }
  return MEMBER_PAYMENT_CHECKOUT_PATH;
}

export function paymentCheckoutReturnPath(source: PaymentCheckoutSource): string {
  switch (source) {
    case "gift":
      return "/user/gift-cards";
    case "dropin":
      return MARKETING_SCHEDULE_PATH;
    case "package":
      return "/user/packages";
    default:
      return "/user/payments";
  }
}
