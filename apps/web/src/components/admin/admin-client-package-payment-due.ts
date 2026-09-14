import { isStudioManualPaymentMethod } from "@/lib/payment-confirmation";

const PENDING_PAYMENT_STATUS = "PENDING";

export type StudioPackagePaymentDueInput = {
  paymentStatus: string | null;
  paymentMethod: string | null;
  usedSessions: number | null;
  guestSlotsTotal?: number;
  guestSlotsRemaining?: number;
  typeBalances?: readonly { usedSessions: number | null }[];
};

/** True when the membership has already consumed a class or guest credit. */
export function studioPackageHasConsumedCredit(
  item: StudioPackagePaymentDueInput,
): boolean {
  if ((item.usedSessions ?? 0) > 0) {
    return true;
  }
  if (item.typeBalances?.some((balance) => (balance.usedSessions ?? 0) > 0)) {
    return true;
  }
  const guestTotal = item.guestSlotsTotal ?? 0;
  const guestRemaining = item.guestSlotsRemaining ?? 0;
  return guestTotal > 0 && guestTotal - guestRemaining > 0;
}

/**
 * Staff-assigned cash/terminal packages stay bookable while unpaid.
 * Show the dashboard warning only after the client has used the package.
 */
export function shouldShowStudioPackagePaymentDue(
  item: StudioPackagePaymentDueInput,
): boolean {
  if (item.paymentStatus !== PENDING_PAYMENT_STATUS) {
    return false;
  }
  if (!isStudioManualPaymentMethod(item.paymentMethod)) {
    return false;
  }
  return studioPackageHasConsumedCredit(item);
}
