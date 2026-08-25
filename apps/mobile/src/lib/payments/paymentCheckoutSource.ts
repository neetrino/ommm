export const PAYMENT_CHECKOUT_SOURCES = [
  "gift",
  "dropin",
  "package",
  "other",
] as const;

export type PaymentCheckoutSource = (typeof PAYMENT_CHECKOUT_SOURCES)[number];

export type PaymentOutcomeKind = "success" | "failed" | "pending";

export function parsePaymentCheckoutSource(
  value: string | string[] | undefined,
): PaymentCheckoutSource {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "gift" || raw === "dropin" || raw === "package") {
    return raw;
  }
  return "other";
}

export function parsePaymentReference(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return null;
  }
  return raw.trim();
}

/** Where “Continue” should send the member after an outcome screen. */
export function paymentCheckoutReturnPath(source: PaymentCheckoutSource): string {
  switch (source) {
    case "gift":
      return "/user/gift-cards";
    case "dropin":
      return "/user/schedule";
    case "package":
      return "/user/packages";
    default:
      return "/user/payments";
  }
}
