import type {
  PaymentCheckoutSource,
  PaymentOutcomeKind,
} from "./paymentCheckoutSource";

const OUTCOME_PATH: Record<PaymentOutcomeKind, string> = {
  success: "/user/payment/success",
  failed: "/user/payment/fail",
  pending: "/user/payment/pending",
};

/** Builds an in-app payment outcome href (local preview + post-checkout). */
export function buildPaymentOutcomeHref(
  outcome: PaymentOutcomeKind,
  params?: {
    reference?: string | null;
    source?: PaymentCheckoutSource;
  },
): string {
  const query = new URLSearchParams();
  if (params?.reference) {
    query.set("reference", params.reference);
  }
  if (params?.source) {
    query.set("source", params.source);
  }
  const qs = query.toString();
  return qs.length > 0 ? `${OUTCOME_PATH[outcome]}?${qs}` : OUTCOME_PATH[outcome];
}
