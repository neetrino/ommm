const AMD_SYMBOL = "֏";

/**
 * Formats studio money fields stored as whole AMD (field names often end in `Cents`).
 * Matches web `formatAmdFromCents` — no fractional dram display.
 */
export function formatAmdFromCents(cents: number): string {
  const amount = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(cents));
  return `${amount} ${AMD_SYMBOL}`;
}
