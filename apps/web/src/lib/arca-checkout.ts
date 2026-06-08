import { ApiError, apiFetch } from "@/lib/api";
import type { PaymentCheckoutSource } from "@/lib/payment-checkout-source";

type ArcaInitResponse = {
  redirectUrl: string;
};

/** True when the browser should redirect to the Arca bank payment page. */
export function isArcaCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ARCA_CHECKOUT_ENABLED === "true";
}

/** Starts Arca card checkout — redirects the browser to the bank payment page. */
export async function startArcaCardCheckout(
  paymentReference: string,
  locale: string,
): Promise<void> {
  const result = await apiFetch<ArcaInitResponse>("/payments/arca/init", {
    method: "POST",
    body: JSON.stringify({ paymentReference, locale }),
  });
  window.location.href = result.redirectUrl;
}

/** Dev / fallback: confirm card payment in-app (no bank redirect). */
export async function confirmSimulatedCardCheckout(
  paymentReference: string,
  source: PaymentCheckoutSource,
): Promise<void> {
  const path = resolveCardConfirmPath(source, paymentReference);
  await apiFetch(path, {
    method: "POST",
    body: JSON.stringify({ paymentMethod: "CARD" }),
  });
}

function resolveCardConfirmPath(
  source: PaymentCheckoutSource,
  reference: string,
): string {
  if (source === "gift") {
    return `/payments/checkout/gift/${reference}/confirm`;
  }
  if (source === "dropin") {
    return `/payments/checkout/dropin/${reference}/confirm`;
  }
  throw new Error(`Card confirm is not supported for source: ${source}`);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
