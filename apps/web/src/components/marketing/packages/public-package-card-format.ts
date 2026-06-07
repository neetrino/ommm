import { formatAmdFromCents, splitAmdFormatted } from "@/lib/price-amd";
export { formatPackagePlanName as formatPublicPackagePlanName } from "@/components/admin/admin-packages-display";

export function formatPublicPackagePriceParts(amount: string): {
  symbol: string;
  value: string;
} {
  return splitAmdFormatted(amount);
}

export function normalizePublicPackageTierLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function shouldShowPublicPackageTierName(
  planName: string,
  categoryLabel: string,
): boolean {
  return (
    normalizePublicPackageTierLabel(planName) !==
    normalizePublicPackageTierLabel(categoryLabel)
  );
}

export function formatPublicPackageTierPriceLine(
  priceCents: number,
  locale: string,
  priceLine: (values: { amount: string }) => string,
): string {
  const tierAmount = formatAmdFromCents(priceCents, locale);
  const tierPrice = formatPublicPackagePriceParts(tierAmount);
  const suffix = tierPrice.symbol.length > 0 ? ` ${tierPrice.symbol}` : "";
  return `${priceLine({ amount: tierPrice.value })}${suffix}`;
}
