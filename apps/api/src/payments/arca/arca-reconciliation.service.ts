import { Injectable, Logger } from '@nestjs/common';

import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { ArcaConfig } from './arca.config';
import { cleanupBanklessOrphanPendingPayments } from './arca-orphan-cleanup.util';
import { ArcaPaymentSyncService } from './arca-payment-sync.service';
import {
  ARCA_RECONCILE_BATCH_SIZE,
  ARCA_RECONCILE_MAX_AGE_MS,
  ARCA_RECONCILE_MIN_AGE_MS,
  ARCA_RECONCILIATION_ENABLED_ENV,
} from './arca.constants';
import { cleanupUnpaidCancelledUserPackages } from '../../packages/cleanup-unpaid-cancelled-packages.util';

type ReconciliationSummary = {
  checked: number;
  confirmed: number;
  failed: number;
};

/**
 * Recovers card payments whose browser callback never returned: Arca has no server-to-server
 * webhook, so a deposited order can otherwise stay PENDING forever. Runs on a schedule and
 * re-verifies every stuck pending payment directly against the bank.
 */
@Injectable()
export class ArcaReconciliationService {
  private readonly logger = new Logger(ArcaReconciliationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly arcaConfig: ArcaConfig,
    private readonly paymentSync: ArcaPaymentSyncService,
  ) {}

  /** Invoked by CronBatchService (every 30 min). */
  async reconcilePendingPaymentsCron(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    await cleanupBanklessOrphanPendingPayments(this.prisma, this.logger);

    const removedFakeCancelled = await cleanupUnpaidCancelledUserPackages(
      this.prisma,
    );
    if (removedFakeCancelled > 0) {
      this.logger.log(
        `Removed ${removedFakeCancelled} unpaid CANCELLED user package(s) from failed checkouts.`,
      );
    }

    const summary = await this.reconcilePendingPayments();
    if (summary.confirmed > 0 || summary.failed > 0) {
      this.logger.log(
        `Arca reconciliation: confirmed ${summary.confirmed}, failed ${summary.failed}, checked ${summary.checked}.`,
      );
    }
  }

  /** Re-checks stuck pending card payments against Arca and transitions them. */
  async reconcilePendingPayments(
    now: Date = new Date(),
  ): Promise<ReconciliationSummary> {
    const payments = await this.findStuckPendingPayments(now);

    let confirmed = 0;
    let failed = 0;
    for (const payment of payments) {
      const outcome = await this.paymentSync.syncPayment(payment.id);
      if (outcome === 'deposited') {
        confirmed += 1;
      } else if (outcome === 'failed') {
        failed += 1;
      }
    }

    return { checked: payments.length, confirmed, failed };
  }

  private findStuckPendingPayments(now: Date): Promise<Array<{ id: string }>> {
    const oldestAllowed = new Date(now.getTime() - ARCA_RECONCILE_MAX_AGE_MS);
    const newestAllowed = new Date(now.getTime() - ARCA_RECONCILE_MIN_AGE_MS);

    return this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        paymentMethod: ManualPaymentMethod.CARD,
        metadata: { path: ['provider'], equals: 'arca' },
        createdAt: { gte: oldestAllowed, lte: newestAllowed },
      },
      orderBy: { createdAt: 'asc' },
      take: ARCA_RECONCILE_BATCH_SIZE,
      select: { id: true },
    });
  }

  private isEnabled(): boolean {
    if (!this.arcaConfig.isConfigured()) {
      return false;
    }
    return process.env[ARCA_RECONCILIATION_ENABLED_ENV] !== 'false';
  }
}
