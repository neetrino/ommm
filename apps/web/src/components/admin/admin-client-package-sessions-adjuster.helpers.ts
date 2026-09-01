import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import type {
  ClientSheetPackageItem,
  ClientSheetPackageTypeBalance,
} from "@/components/admin/admin-clients-types";

export const ADMIN_PACKAGE_SESSION_ADJUST_MIN = 1;
export const ADMIN_PACKAGE_SESSION_ADJUST_MAX = 20;

export function limitedPackageTypeBalances(
  item: ClientSheetPackageItem,
): ClientSheetPackageTypeBalance[] {
  return (item.typeBalances ?? []).filter((balance) => !balance.isUnlimited);
}

export function canAdjustClientPackageSessions(item: ClientSheetPackageItem): boolean {
  if (item.isUnlimited) {
    return false;
  }
  const status = normalizeUserPackageStatus(item.status);
  return status !== "CANCELLED" && status !== "PENDING";
}
