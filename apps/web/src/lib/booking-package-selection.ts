import type { EligibleBookingPackage } from "./eligible-booking-package";

export function isSelectableBookingPackage(
  pkg: EligibleBookingPackage,
): boolean {
  return pkg.canBook || pkg.canBookGuest === true;
}

export function hasBookablePackage(
  packages: readonly EligibleBookingPackage[],
): boolean {
  return packages.some(isSelectableBookingPackage);
}

export function pickDefaultBookingPackageId(
  packages: readonly EligibleBookingPackage[],
): string {
  const owner = packages.find((pkg) => pkg.canBook);
  if (owner !== undefined) {
    return owner.userPackageId;
  }
  const guest = packages.find((pkg) => pkg.canBookGuest === true);
  return guest?.userPackageId ?? packages[0]?.userPackageId ?? "";
}

export function shouldPromptBookingPackageSelection(
  packages: readonly EligibleBookingPackage[],
): boolean {
  if (!hasBookablePackage(packages)) {
    return false;
  }
  if (packages.some((pkg) => pkg.canBookGuest === true)) {
    return true;
  }
  return packages.filter((pkg) => pkg.canBook).length > 1;
}

export function resolveAutoBookPackageId(
  packages: readonly EligibleBookingPackage[],
): string | undefined {
  const selectable = packages.filter(isSelectableBookingPackage);
  if (selectable.length !== 1) {
    return undefined;
  }
  const only = selectable[0];
  if (only === undefined || only.canBookGuest === true) {
    return undefined;
  }
  return only.canBook ? only.userPackageId : undefined;
}
