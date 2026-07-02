import {
  SESSION_BOOKING_PURCHASE_CACHE_PREFIX,
  type SessionBookingCachedPurchase,
} from "@/hooks/use-session-booking.types";

/** Snapshot of the open purchase modal so a refresh can restore it instantly. */
export function readSessionBookingCachedPurchase(sessionId: string): SessionBookingCachedPurchase | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_BOOKING_PURCHASE_CACHE_PREFIX + sessionId);
    return raw ? (JSON.parse(raw) as SessionBookingCachedPurchase) : null;
  } catch {
    return null;
  }
}

export function writeSessionBookingCachedPurchase(
  sessionId: string,
  value: SessionBookingCachedPurchase,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(
      SESSION_BOOKING_PURCHASE_CACHE_PREFIX + sessionId,
      JSON.stringify(value),
    );
  } catch {
    // Ignore quota/serialization errors — cache is best-effort.
  }
}

export function clearSessionBookingCachedPurchase(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(SESSION_BOOKING_PURCHASE_CACHE_PREFIX + sessionId);
  } catch {
    // Ignore — cache is best-effort.
  }
}
