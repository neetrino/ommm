import { apiFetch } from "@/lib/api";

/** Holds a session spot while the member cancel confirmation dialog is open. */
export async function registerBookingCancelIntent(bookingId: string): Promise<void> {
  await apiFetch(`/bookings/${bookingId}/cancel-intent`, { method: "POST" });
}

/** Releases a held spot when the cancel dialog is dismissed without confirming. */
export async function clearBookingCancelIntent(bookingId: string): Promise<void> {
  await apiFetch(`/bookings/${bookingId}/cancel-intent`, { method: "DELETE" });
}
