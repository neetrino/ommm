import type { MarketingHeaderAccount } from "@/components/marketing/marketing-site-header";

const CACHE_KEY = "ommm_marketing_header_account_v1";

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
}

/** Clears cached account on logout. */
export function clearCachedMarketingHeaderAccount(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(CACHE_KEY);
}
