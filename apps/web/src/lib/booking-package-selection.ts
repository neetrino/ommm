import type { EligibleBookingPackage } from "./eligible-booking-package";
import { GUEST_PASSES_ENABLED } from "@/lib/guest-passes";

function allowsGuestPass(pkg: EligibleBookingPackage): boolean {
  return GUEST_PASSES_ENABLED && pkg.canBookGuest === true;
}

export function isSelectableBookingPackage(
  pkg: EligibleBookingPackage,
): boolean {
  return pkg.canBook || allowsGuestPass(pkg);
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
  const guest = packages.find((pkg) => allowsGuestPass(pkg));
  return guest?.userPackageId ?? packages[0]?.userPackageId ?? "";
}

export function shouldPromptBookingPackageSelection(
  packages: readonly EligibleBookingPackage[],
): boolean {
  if (!hasBookablePackage(packages)) {
    return false;
  }
  if (packages.some((pkg) => allowsGuestPass(pkg))) {
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
  if (only === undefined || allowsGuestPass(only)) {
    return undefined;
  }
  return only.canBook ? only.userPackageId : undefined;
}
