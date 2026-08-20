import {
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type Prisma,
} from '@prisma/client';

const LIST_STATUS_PRIORITY: Record<UserPackageStatus, number> = {
  [UserPackageStatus.ACTIVE]: 0,
  [UserPackageStatus.PAUSED]: 1,
  [UserPackageStatus.PENDING]: 2,
  [UserPackageStatus.EXPIRED]: 3,
  [UserPackageStatus.CANCELLED]: 4,
};

/**
 * Packages shown in client/admin history:
 * - only packages with a SUCCEEDED package payment (still valid purchase)
 * - PENDING never (checkout in flight / not paid)
 * - refunded payments drop out of SUCCEEDED → package leaves this list
 */
export function buildVisibleUserPackagesWhere(
  userId: string,
  succeededPackageIds: readonly string[],
): Prisma.UserPackageWhereInput {
  return {
    userId,
    id: { in: [...succeededPackageIds] },
    status: {
      in: [
        UserPackageStatus.ACTIVE,
        UserPackageStatus.PAUSED,
        UserPackageStatus.EXPIRED,
        UserPackageStatus.CANCELLED,
      ],
    },
  };
}

export async function loadSucceededPackageSourceIds(
  db: {
    payment: {
      findMany: (args: {
        where: Prisma.PaymentWhereInput;
        select: { sourceId: true };
      }) => Promise<Array<{ sourceId: string | null }>>;
    };
  },
  userId: string,
): Promise<string[]> {
  const rows = await db.payment.findMany({
    where: {
      userId,
      source: PaymentSource.PACKAGE,
      status: PaymentStatus.SUCCEEDED,
      sourceId: { not: null },
    },
    select: { sourceId: true },
  });
  return rows
    .map((row) => row.sourceId)
    .filter((id): id is string => id !== null);
}

export function compareUserPackagesForClientList<
  T extends { status: UserPackageStatus; createdAt: Date },
>(left: T, right: T): number {
  const statusDelta =
    LIST_STATUS_PRIORITY[left.status] - LIST_STATUS_PRIORITY[right.status];
  if (statusDelta !== 0) {
    return statusDelta;
  }
  return right.createdAt.getTime() - left.createdAt.getTime();
}
