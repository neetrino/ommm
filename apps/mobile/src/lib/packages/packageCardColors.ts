/** Deterministic wellness palette — matches web `package-card-colors.ts`. */
export const PACKAGE_CARD_GRADIENT_START_PALETTE = [
  "#fbf5d5",
  "#e5f4f9",
  "#f6d0bd",
  "#ede9dd",
  "#d9d9d9",
  "#e8f0e4",
  "#f0e8f4",
  "#f5ebe0",
  "#dce8e0",
  "#eae4dc",
] as const;

const DEFAULT_PACKAGE_CARD_GRADIENT_START = PACKAGE_CARD_GRADIENT_START_PALETTE[0];

export function hashPackageCardColorKey(categoryKey: string): number {
  let hash = 0;
  const normalized = categoryKey.trim().toLocaleLowerCase();
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function resolvePackageCardPaletteIndex(categoryKey: string): number {
  return hashPackageCardColorKey(categoryKey) % PACKAGE_CARD_GRADIENT_START_PALETTE.length;
}

export function resolvePackageCardGradientStartColor(
  categoryKey: string,
  previousGradientStart: string | null,
): string {
  const palette = PACKAGE_CARD_GRADIENT_START_PALETTE;
  let index = resolvePackageCardPaletteIndex(categoryKey);

  if (previousGradientStart !== null) {
    let guard = 0;
    while (palette[index] === previousGradientStart && guard < palette.length) {
      index = (index + 1) % palette.length;
      guard += 1;
    }
  }

  return palette[index] ?? DEFAULT_PACKAGE_CARD_GRADIENT_START;
}

export function assignPackageCardGradientStartColors(
  categoryKeys: readonly string[],
): string[] {
  let previousGradientStart: string | null = null;
  return categoryKeys.map((categoryKey) => {
    const gradientStart = resolvePackageCardGradientStartColor(
      categoryKey,
      previousGradientStart,
    );
    previousGradientStart = gradientStart;
    return gradientStart;
  });
}
