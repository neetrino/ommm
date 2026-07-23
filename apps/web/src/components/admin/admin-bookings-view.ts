export type BookingsView = "list" | "weekly";

export const BOOKINGS_VIEW_MODES: readonly BookingsView[] = ["list", "weekly"];

/** Normalizes legacy URL/localStorage view params to supported bookings views. */
export function resolveBookingsView(value: string | undefined): BookingsView {
  return value === "weekly" ? "weekly" : "list";
}
