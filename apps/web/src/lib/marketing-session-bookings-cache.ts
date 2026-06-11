import type { UserSessionBookingMap } from "@/lib/user-session-bookings-map";

const CACHE_KEY = "ommm_marketing_session_bookings_v1";
export const MARKETING_SESSION_BOOKINGS_UPDATED = "ommm-marketing-session-bookings-updated";

/** Stable empty snapshot for SSR and cache misses (useSyncExternalStore requires referential stability). */
export const EMPTY_MARKETING_SESSION_BOOKINGS: UserSessionBookingMap = {};

let clientSnapshot: UserSessionBookingMap = EMPTY_MARKETING_SESSION_BOOKINGS;
let storageHydrated = false;

function isSessionBookingMap(value: unknown): value is UserSessionBookingMap {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.values(value).every((entry) => typeof entry === "string");
}

function hydrateClientSnapshotFromStorage(): void {
  if (storageHydrated || typeof sessionStorage === "undefined") {
    return;
  }
  storageHydrated = true;

  const raw = sessionStorage.getItem(CACHE_KEY);
  if (raw === null || raw === "") {
    return;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isSessionBookingMap(parsed)) {
      clientSnapshot = parsed;
    }
  } catch {
    // Keep the stable empty snapshot when storage is corrupt.
  }
}

/** useSyncExternalStore client snapshot — same reference until cache writes. */
export function getMarketingSessionBookingsClientSnapshot(): UserSessionBookingMap {
  hydrateClientSnapshotFromStorage();
  return clientSnapshot;
}

/** useSyncExternalStore server snapshot — must stay referentially stable. */
export function getMarketingSessionBookingsServerSnapshot(): UserSessionBookingMap {
  return EMPTY_MARKETING_SESSION_BOOKINGS;
}

/** Last known schedule booking ids — instant restore on marketing schedule. */
export function readCachedMarketingSessionBookings(): UserSessionBookingMap {
  return getMarketingSessionBookingsClientSnapshot();
}

export function writeCachedMarketingSessionBookings(
  bookings: UserSessionBookingMap,
): void {
  storageHydrated = true;
  clientSnapshot = bookings;

  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(bookings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARKETING_SESSION_BOOKINGS_UPDATED));
  }
}

export function clearCachedMarketingSessionBookings(): void {
  storageHydrated = true;
  clientSnapshot = EMPTY_MARKETING_SESSION_BOOKINGS;

  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(CACHE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARKETING_SESSION_BOOKINGS_UPDATED));
  }
}
