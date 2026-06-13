import { PackageStatus } from '@prisma/client';

/** Membership states that must be resolved before a catalog plan can be removed. */
export const PACKAGE_PLAN_DELETION_BLOCKING_STATUSES: readonly PackageStatus[] =
  [PackageStatus.ACTIVE, PackageStatus.PENDING, PackageStatus.PAUSED];

/** Historical memberships that can be purged automatically during plan deletion. */
export const PACKAGE_PLAN_DELETION_PURGEABLE_STATUSES: readonly PackageStatus[] =
  [PackageStatus.CANCELLED, PackageStatus.EXPIRED];
