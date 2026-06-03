const AMD_SYMBOL = "֏";

function formatAmdNumber(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatAmdFromCents(cents: number, locale: string): string {
  return `${AMD_SYMBOL} ${formatAmdNumber(cents, locale)}`;
}

export function formatAmdFromMajor(amount: number, locale: string): string {
  return `${AMD_SYMBOL} ${formatAmdNumber(amount, locale)}`;
}
