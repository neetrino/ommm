import type { ClientListPackageTone } from "@/components/admin/admin-client-list-package-badge";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";
import type { EligibleBookingPackage } from "@/lib/eligible-booking-package";

export const SESSION_ADD_SEARCH_DEBOUNCE_MS = 300;
export const SESSION_ADD_SEARCH_MIN_LENGTH = 2;
export const SESSION_ADD_SEARCH_TAKE = 8;

export function buildSessionAddClientSearchUrl(query: string): string {
  const params = new URLSearchParams();
  params.set("search", query.trim());
  params.set("take", String(SESSION_ADD_SEARCH_TAKE));
  params.set("offset", "0");
  return `/clients?${params.toString()}`;
}

export function parseClientSearchRows(
  payload: AdminClientsPayload | readonly ClientRow[],
): ClientRow[] {
  if ("rows" in payload) {
    return [...payload.rows];
  }
  return [...payload];
}

export function pickOwnerBookablePackageId(
  packages: readonly EligibleBookingPackage[],
): string | null {
  const owner = packages.find((pkg) => pkg.canBook);
  return owner?.userPackageId ?? null;
}

export function canAddVisitorToSession(params: {
  booked: number;
  capacity: number;
  startsAt: string;
  nowMs?: number;
}): boolean {
  if (params.booked >= params.capacity) {
    return false;
  }
  return new Date(params.startsAt).getTime() > (params.nowMs ?? Date.now());
}

export function isSearchQueryReady(query: string): boolean {
  return query.trim().length >= SESSION_ADD_SEARCH_MIN_LENGTH;
}

/** List badge "ACTIVE" means a current package — only those can be offered Add. */
export function canOfferSessionAdd(params: {
  packageTone: ClientListPackageTone;
  alreadyRegistered: boolean;
  blocked: boolean;
}): boolean {
  return (
    params.packageTone === "active" && !params.alreadyRegistered && !params.blocked
  );
}
