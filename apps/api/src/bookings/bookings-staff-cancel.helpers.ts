import { BookingStatus, UserPackageStatus } from '@prisma/client';

export const STAFF_CANCEL_INVALID_STATUS_MESSAGE = 'Cannot cancel this booking';

export const STAFF_CANCEL_PACKAGE_EXPIRED_MESSAGE =
  'Cannot cancel this booking because the package has expired';

export const STAFF_CANCELLABLE_BOOKING_STATUSES = [
  BookingStatus.BOOKED,
  BookingStatus.COMPLETED,
  BookingStatus.MISSED,
] as const;

export const BOOKING_CANCELLED_BY_SELECT = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  role: true,
} as const;

export type StaffCancellableBookingStatus =
  (typeof STAFF_CANCELLABLE_BOOKING_STATUSES)[number];

export type PackagePeriodForStaffCancel = {
  currentPeriodEnd: Date;
  status: UserPackageStatus;
};

export function isStaffCancellableBookingStatus(
  status: BookingStatus,
): status is StaffCancellableBookingStatus {
  return STAFF_CANCELLABLE_BOOKING_STATUSES.some(
    (allowed) => allowed === status,
  );
}

/** Completed / missed visits restore credit only while the package is still valid. */
export function requiresOpenPackagePeriod(status: BookingStatus): boolean {
  return (
    status === BookingStatus.COMPLETED || status === BookingStatus.MISSED
  );
}

export function isUserPackagePeriodOpen(
  pack: PackagePeriodForStaffCancel,
  now: Date,
): boolean {
  if (
    pack.status === UserPackageStatus.EXPIRED ||
    pack.status === UserPackageStatus.CANCELLED
  ) {
    return false;
  }
  return now.getTime() <= pack.currentPeriodEnd.getTime();
}

export function packagesAllowStaffCancel(
  packs: readonly PackagePeriodForStaffCancel[],
  now: Date,
): boolean {
  return packs.every((pack) => isUserPackagePeriodOpen(pack, now));
}
