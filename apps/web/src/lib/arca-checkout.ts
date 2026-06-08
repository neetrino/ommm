import { ApiError, apiFetch } from "@/lib/api";

type ArcaInitResponse = {
  redirectUrl: string;
};

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

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
