import { formatAmdFromCents } from "@/lib/price-amd";

type AmdMoneyTextProps = {
  cents: number;
  locale: string;
  className?: string;
};

/** Canonical AMD display — comma grouping, dram symbol after the amount. */
export function AmdMoneyText({ cents, locale, className }: AmdMoneyTextProps) {
  return <span className={className}>{formatAmdFromCents(cents, locale)}</span>;
}
