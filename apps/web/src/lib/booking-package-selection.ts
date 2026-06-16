import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";

export function pickDefaultBookingPackageId(
  packages: readonly EligibleBookingPackage[],
): string {
  const bookable = packages.find((pkg) => pkg.canBook);
  return bookable?.userPackageId ?? packages[0]?.userPackageId ?? "";
}

export function shouldPromptBookingPackageSelection(
  packages: readonly EligibleBookingPackage[],
): boolean {
  return packages.length > 1;
}

export function resolveAutoBookPackageId(
  packages: readonly EligibleBookingPackage[],
): string | undefined {
  if (packages.length !== 1) {
    return undefined;
  }
  const only = packages[0];
  return only?.canBook ? only.userPackageId : undefined;
}
