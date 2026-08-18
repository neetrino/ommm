import type { Role, UserPackageStatus } from '@prisma/client';

export const USER_PACKAGE_FREEZE_INITIATOR = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
} as const;

export type UserPackageFreezeInitiator =
  (typeof USER_PACKAGE_FREEZE_INITIATOR)[keyof typeof USER_PACKAGE_FREEZE_INITIATOR];

export const USER_PACKAGE_FREEZE_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const;

export type UserPackageFreezeStatus =
  (typeof USER_PACKAGE_FREEZE_STATUS)[keyof typeof USER_PACKAGE_FREEZE_STATUS];

export type PackagePlanFreezeFields = {
  freezeAllowedCount: number;
  freezeMaxDaysPerUse: number;
};

export type UserPackageFreezeFields = {
  status: UserPackageStatus;
  freezeAllowedCountSnapshot: number;
  freezeMaxDaysPerUseSnapshot: number;
  freezesUsedCount: number;
  pausedAt: Date | null;
  pausedUntil: Date | null;
};

export type UserPackageFreezeRow = {
  id: string;
  userPackageId: string;
  startedAt: Date;
  scheduledEndAt: Date;
  status: UserPackageFreezeStatus;
};

export type LoadedUserPackage = UserPackageFreezeFields & {
  id: string;
  userId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  plan: PackagePlanFreezeFields | null;
  user: { id: string; role: Role };
};

export type ResumableUserPackage = {
  id: string;
  currentPeriodEnd: Date;
  freezes?: UserPackageFreezeRow[];
};

export type UserPackageFreezeUpdateData = {
  status?: UserPackageStatus;
  currentPeriodEnd?: Date;
  pausedAt?: Date | null;
  pausedUntil?: Date | null;
  freezesUsedCount?: { increment: number };
  freezeAllowedCountSnapshot?: number;
  freezeMaxDaysPerUseSnapshot?: number;
};

export type FreezeResumeClient = {
  userPackage: {
    findMany: (args: unknown) => Promise<ResumableUserPackage[]>;
    update: (args: {
      where: { id: string };
      data: UserPackageFreezeUpdateData;
    }) => Promise<unknown>;
  };
  userPackageFreeze: {
    update: (args: {
      where: { id: string };
      data: { status: UserPackageFreezeStatus; endedAt: Date };
    }) => Promise<unknown>;
  };
};

export type FreezeDb = FreezeResumeClient & {
  userPackage: {
    findMany: FreezeResumeClient['userPackage']['findMany'];
    update: (args: {
      where: { id: string };
      data: UserPackageFreezeUpdateData;
      include?: { plan: true };
    }) => Promise<LoadedUserPackage>;
    findFirst: (args: unknown) => Promise<LoadedUserPackage | null>;
    findUnique: (args: unknown) => Promise<LoadedUserPackage | null>;
  };
  userPackageFreeze: FreezeResumeClient['userPackageFreeze'] & {
    create: (args: {
      data: {
        userPackageId: string;
        daysRequested: number;
        startedAt: Date;
        scheduledEndAt: Date;
        initiatedBy: UserPackageFreezeInitiator;
        initiatedByUserId: string;
        status: UserPackageFreezeStatus;
      };
    }) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<UserPackageFreezeRow | null>;
  };
  booking: {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
  };
  $transaction: <T>(fn: (tx: FreezeDb) => Promise<T>) => Promise<T>;
};

/** Narrow Prisma (or a test mock) to the freeze port. */
export function asFreezeDb(prisma: object): FreezeDb {
  return prisma as FreezeDb;
}
