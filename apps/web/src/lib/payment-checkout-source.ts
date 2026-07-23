import { MARKETING_SCHEDULE_PATH } from "@/lib/auth-redirect";

export const PAYMENT_CHECKOUT_SOURCES = ["gift", "dropin", "package", "other"] as const;

export type PaymentCheckoutSource = (typeof PAYMENT_CHECKOUT_SOURCES)[number];

export function parsePaymentCheckoutSource(
  value: string | undefined,
): PaymentCheckoutSource {
  if (value === "gift" || value === "dropin" || value === "package") {
    return value;
  }
  return "other";
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
