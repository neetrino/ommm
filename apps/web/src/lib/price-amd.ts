/** Armenian dram sign — always rendered after the numeric amount. */
export const AMD_SYMBOL = "֏";

/** Fixed locale so thousand separators are always commas across UI locales. */
const AMD_GROUPING_LOCALE = "en-US";

type FormatAmdAmountOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

function formatAmdNumber(
  amount: number,
  options: FormatAmdAmountOptions = {},
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;
  return new Intl.NumberFormat(AMD_GROUPING_LOCALE, {
    useGrouping: true,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/** Formats whole AMD amounts stored in `priceCents` / `amountCents` fields. */
export function formatAmdFromCents(cents: number, locale?: string): string {
  void locale;
  return `${formatAmdNumber(Math.round(cents))} ${AMD_SYMBOL}`;
}

/** Formats whole AMD amounts already expressed in major units. */
export function formatAmdFromMajor(amount: number, locale?: string): string {
  void locale;
  return `${formatAmdNumber(Math.round(amount))} ${AMD_SYMBOL}`;
}

/** Formats AMD with optional fractional digits (e.g. price per session). */
export function formatAmdAmount(
  amount: number,
  options: FormatAmdAmountOptions = {},
): string {
  return `${formatAmdNumber(amount, options)} ${AMD_SYMBOL}`;
}

/** Parses formatted or raw money input into whole AMD; null when empty/invalid. */
export function parseAmdMoneyInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) {
    return null;
  }
  const amount = Number.parseInt(digits, 10);
  if (!Number.isSafeInteger(amount)) {
    return null;
  }
  return amount;
}

/** Formats raw digit strings for money inputs with thousand separators. */
export function formatAmdMoneyInputDisplay(rawDigits: string): string {
  const parsed = parseAmdMoneyInput(rawDigits);
  if (parsed === null) {
    return "";
  }
  return formatAmdNumber(parsed);
}

/** Splits a formatted AMD string into numeric and symbol parts for styled layouts. */
export function splitAmdFormatted(amount: string): { value: string; symbol: string } {
  const trimmed = amount.trim();
  if (trimmed.endsWith(AMD_SYMBOL)) {
    return {
      value: trimmed.slice(0, -AMD_SYMBOL.length).trimEnd(),
      symbol: AMD_SYMBOL,
    };
  }
  if (trimmed.startsWith(AMD_SYMBOL)) {
    return {
      value: trimmed.slice(AMD_SYMBOL.length).trimStart(),
      symbol: AMD_SYMBOL,
    };
  }
  return { symbol: "", value: trimmed };
}
