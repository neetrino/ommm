const AMD_SYMBOL = "֏";

function formatAmdNumber(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatAmdFromCents(cents: number, locale: string): string {
  const major = cents / 100;
  return `${AMD_SYMBOL} ${formatAmdNumber(major, locale)}`;
}

export function formatAmdFromMajor(amount: number, locale: string): string {
  return `${AMD_SYMBOL} ${formatAmdNumber(amount, locale)}`;
}
