import {
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
} from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

const FAKE_CANCELLED_CLEANUP_BATCH_SIZE = 100;

/**
 * Hides CANCELLED UserPackages that never had a SUCCEEDED payment.
 * The row stays so a later complaint can still see the checkout.
 */
export async function cleanupUnpaidCancelledUserPackages(
  prisma: PrismaService,
): Promise<number> {
  const candidates = await prisma.userPackage.findMany({
    where: { status: UserPackageStatus.CANCELLED, removedAt: null },
    select: { id: true },
    take: FAKE_CANCELLED_CLEANUP_BATCH_SIZE,
    orderBy: { createdAt: 'asc' },
  });
  if (candidates.length === 0) {
    return 0;
  }

  const ids = candidates.map((row) => row.id);
  const succeeded = await prisma.payment.findMany({
    where: {
      source: PaymentSource.PACKAGE,
      status: PaymentStatus.SUCCEEDED,
      sourceId: { in: ids },
    },
    select: { sourceId: true },
  });
  const paidIds = new Set(
    succeeded
      .map((row) => row.sourceId)
      .filter((id): id is string => id !== null),
  );
  const unpaidIds = ids.filter((id) => !paidIds.has(id));
  if (unpaidIds.length === 0) {
    return 0;
  }

  // Skip packages that already consumed sessions (should not happen for unpaid).
  const withConsumptions = await prisma.bookingConsumption.findMany({
    where: { userPackageId: { in: unpaidIds } },
    select: { userPackageId: true },
    distinct: ['userPackageId'],
  });
  const usedIds = new Set(withConsumptions.map((row) => row.userPackageId));
  const deletableIds = unpaidIds.filter((id) => !usedIds.has(id));
  if (deletableIds.length === 0) {
    return 0;
  }

  const hidden = await prisma.userPackage.updateMany({
    where: {
      id: { in: deletableIds },
      status: UserPackageStatus.CANCELLED,
      removedAt: null,
    },
    data: { removedAt: new Date() },
  });
  return hidden.count;
}
