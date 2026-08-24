/** Standalone browser return pages after Arca checkout (outside member Payments hub). */
export const PAYMENT_SUCCESS_PATH = "/payment/success";
export const PAYMENT_FAIL_PATH = "/payment/fail";
export const PAYMENT_PENDING_PATH = "/payment/pending";
export const PAYMENT_RECEIPT_PATH = "/payment/receipt";

export function buildPaymentSuccessPath(
  reference: string,
  source?: string,
): string {
  const params = new URLSearchParams({ reference });
  if (source) {
    params.set("source", source);
  }
  return `${PAYMENT_SUCCESS_PATH}?${params.toString()}`;
}

export function buildPaymentReceiptPath(
  reference: string,
  source?: string,
): string {
  const params = new URLSearchParams({ reference });
  if (source) {
    params.set("source", source);
  }
  return `${PAYMENT_RECEIPT_PATH}?${params.toString()}`;
}
