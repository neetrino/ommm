import { Logger } from '@nestjs/common';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import {
  ARCA_ORPHAN_CLEANUP_BATCH_SIZE,
  ARCA_ORPHAN_PENDING_MAX_AGE_MS,
} from './arca.constants';
import { mergeArcaMetadata } from './arca-metadata.util';
import { PAYMENT_STATUS_REASON } from '../payment-status-reason';

export type ArcaOrphanCleanupSummary = {
  scanned: number;
  failedPayments: number;
  cancelledPackages: number;
};

/**
 * Fails abandoned PENDING CARD payments that never registered an Arca bank order
 * (metadata.provider !== 'arca'). Does not touch payments already tracked by Arca
 * reconciliation.
 */
export async function cleanupBanklessOrphanPendingPayments(
  prisma: PrismaService,
  logger: Logger,
  now: Date = new Date(),
): Promise<ArcaOrphanCleanupSummary> {
  const cutoff = new Date(now.getTime() - ARCA_ORPHAN_PENDING_MAX_AGE_MS);
  const orphans = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PENDING,
      paymentMethod: ManualPaymentMethod.CARD,
      createdAt: { lte: cutoff },
      NOT: { metadata: { path: ['provider'], equals: 'arca' } },
    },
    orderBy: { createdAt: 'asc' },
    take: ARCA_ORPHAN_CLEANUP_BATCH_SIZE,
    select: { id: true, source: true, sourceId: true, metadata: true },
  });

  let failedPayments = 0;
  let cancelledPackages = 0;

  for (const payment of orphans) {
    const result = await failBanklessOrphanPayment(prisma, payment);
    failedPayments += result.failedPayment ? 1 : 0;
    cancelledPackages += result.cancelledPackage ? 1 : 0;
  }

  if (failedPayments > 0 || cancelledPackages > 0) {
    logger.log(
      `Arca orphan cleanup: failed ${failedPayments} payment(s), cancelled ${cancelledPackages} package(s), scanned ${orphans.length}.`,
    );
  }

  return {
    scanned: orphans.length,
    failedPayments,
    cancelledPackages,
  };
}

async function failBanklessOrphanPayment(
  prisma: PrismaService,
  payment: {
    id: string;
    source: PaymentSource;
    sourceId: string | null;
    metadata: unknown;
  },
): Promise<{ failedPayment: boolean; cancelledPackage: boolean }> {
  const existing = await prisma.payment.findUnique({
    where: { id: payment.id },
    select: { metadata: true, status: true },
  });
  if (!existing || existing.status !== PaymentStatus.PENDING) {
    return { failedPayment: false, cancelledPackage: false };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      confirmedAt: new Date(),
      paymentMethod: ManualPaymentMethod.CARD,
      metadata: mergeArcaMetadata(existing.metadata, {
        statusReason: PAYMENT_STATUS_REASON.ABANDONED,
      }),
    },
  });

  if (payment.source !== PaymentSource.PACKAGE || payment.sourceId === null) {
    return { failedPayment: true, cancelledPackage: false };
  }

  const cancelled = await prisma.userPackage.deleteMany({
    where: {
      id: payment.sourceId,
      status: UserPackageStatus.PENDING,
    },
  });

  return {
    failedPayment: true,
    cancelledPackage: cancelled.count > 0,
  };
}
