import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";

/** Adds "(2)" style suffixes when multiple eligible rows share the same plan name. */
export function buildDuplicatePlanNameSuffixes(
  packages: readonly EligibleBookingPackage[],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const pkg of packages) {
    counts.set(pkg.planName, (counts.get(pkg.planName) ?? 0) + 1);
  }

  const suffixes = new Map<string, number>();
  const seen = new Map<string, number>();
  for (const pkg of packages) {
    if ((counts.get(pkg.planName) ?? 0) <= 1) {
      continue;
    }
    const next = (seen.get(pkg.planName) ?? 0) + 1;
    seen.set(pkg.planName, next);
    suffixes.set(pkg.userPackageId, next);
  }
  return suffixes;
}
