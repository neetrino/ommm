import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";

export function hasBookablePackage(
  packages: readonly EligibleBookingPackage[],
): boolean {
  return packages.some((pkg) => pkg.canBook);
}

export function pickDefaultBookingPackageId(
  packages: readonly EligibleBookingPackage[],
): string {
  const bookable = packages.find((pkg) => pkg.canBook);
  return bookable?.userPackageId ?? packages[0]?.userPackageId ?? "";
}

export function shouldPromptBookingPackageSelection(
  packages: readonly EligibleBookingPackage[],
): boolean {
  return packages.length > 1 && hasBookablePackage(packages);
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
