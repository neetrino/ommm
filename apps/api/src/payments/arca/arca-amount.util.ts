/** Arca expects AMD amounts in minimal units (whole dram × 100). */
export function toArcaAmdAmount(amountAmd: number): number {
  if (!Number.isInteger(amountAmd) || amountAmd <= 0) {
    throw new Error('Invalid AMD amount for Arca');
  }
  return amountAmd * 100;
}
