import { isStudioManualPaymentMethod } from "@/lib/payment-confirmation";

const PENDING_PAYMENT_STATUS = "PENDING";

export type StudioPackagePaymentDueInput = {
  paymentStatus: string | null;
  paymentMethod: string | null;
  paymentDue?: boolean;
};

/**
 * Staff-assigned cash/terminal packages stay bookable while unpaid.
 * The dashboard warning appears one hour after a consumed class has ended.
 */
export function shouldShowStudioPackagePaymentDue(
  item: StudioPackagePaymentDueInput,
): boolean {
  if (item.paymentDue !== true) {
    return false;
  }
  if (item.paymentStatus !== PENDING_PAYMENT_STATUS) {
    return false;
  }
  return isStudioManualPaymentMethod(item.paymentMethod);
}
