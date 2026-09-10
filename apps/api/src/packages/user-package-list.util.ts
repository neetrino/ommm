import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type Prisma,
} from '@prisma/client';
import { isStudioManualPaymentMethod } from '../payments/studio-manual-payment.util';

const LIST_STATUS_PRIORITY: Record<UserPackageStatus, number> = {
  [UserPackageStatus.PENDING]: 0,
  [UserPackageStatus.ACTIVE]: 1,
  [UserPackageStatus.PAUSED]: 2,
  [UserPackageStatus.EXPIRED]: 3,
  [UserPackageStatus.CANCELLED]: 4,
};

/**
 * Packages shown in client/admin history:
 * - SUCCEEDED package payment (valid purchase)
 * - PENDING cash/terminal (awaiting studio payment)
 * - PENDING CARD checkout stays hidden
 * - refunded payments drop out of SUCCEEDED → package leaves this list
 */
export function buildVisibleUserPackagesWhere(
  userId: string,
  visiblePackageIds: readonly string[],
): Prisma.UserPackageWhereInput {
  return {
    userId,
    id: { in: [...visiblePackageIds] },
    status: {
      in: [
        UserPackageStatus.PENDING,
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
        select: { sourceId: true; status: true; paymentMethod: true };
      }) => Promise<
        Array<{
          sourceId: string | null;
          status: PaymentStatus;
          paymentMethod: ManualPaymentMethod | null;
        }>
      >;
    };
  },
  userId: string,
): Promise<string[]> {
  const rows = await db.payment.findMany({
    where: {
      userId,
      source: PaymentSource.PACKAGE,
      sourceId: { not: null },
      OR: [
        { status: PaymentStatus.SUCCEEDED },
        {
          status: PaymentStatus.PENDING,
          paymentMethod: {
            in: [ManualPaymentMethod.CASH, ManualPaymentMethod.CARD_TERMINAL],
          },
        },
      ],
    },
    select: { sourceId: true, status: true, paymentMethod: true },
  });
  return rows
    .filter(
      (row) =>
        row.status === PaymentStatus.SUCCEEDED ||
        isStudioManualPaymentMethod(row.paymentMethod),
    )
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
