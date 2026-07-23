import type { MarketingHeaderAccount } from "@/components/marketing/marketing-site-header";

const CACHE_KEY = "ommm_marketing_header_account_v1";
export const MARKETING_HEADER_ACCOUNT_UPDATED = "ommm-marketing-header-account-updated";

function isMarketingHeaderAccount(value: unknown): value is MarketingHeaderAccount {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.href === "string" &&
    typeof row.initials === "string" &&
    typeof row.displayName === "string" &&
    (row.imageSrc === null || typeof row.imageSrc === "string")
  );
}

/** Last known header account — read synchronously before paint on refresh. */
export function readCachedMarketingHeaderAccount(): MarketingHeaderAccount | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(CACHE_KEY);
  if (raw === null || raw === "") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isMarketingHeaderAccount(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persists header account for instant restore after refresh. */
export function writeCachedMarketingHeaderAccount(
  account: MarketingHeaderAccount,
): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(account));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARKETING_HEADER_ACCOUNT_UPDATED));
  }
}

/** Clears cached account on logout. */
export function clearCachedMarketingHeaderAccount(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(CACHE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARKETING_HEADER_ACCOUNT_UPDATED));
  }
}
