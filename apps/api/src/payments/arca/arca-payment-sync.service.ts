import { Injectable, Logger } from '@nestjs/common';

import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { PaymentsCheckoutService } from '../payments-checkout.service';

import { ArcaClient } from './arca.client';
import { mergeArcaMetadata, readArcaMetadata } from './arca-metadata.util';
import { evaluateArcaOrderStatus } from './arca-status.util';
import type { ArcaOrderStatusResponse, ArcaSyncOutcome } from './arca.types';

/**
 * Re-checks a pending Arca payment against the bank and transitions it accordingly.
 * Shared by the browser callback and the reconciliation cron so both use identical logic.
 */
@Injectable()
export class ArcaPaymentSyncService {
  private readonly logger = new Logger(ArcaPaymentSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly arcaClient: ArcaClient,
    private readonly checkout: PaymentsCheckoutService,
  ) {}

  /** Verifies one pending payment against Arca and confirms/fails it. Never throws. */
  async syncPayment(paymentId: string): Promise<ArcaSyncOutcome> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return 'not_found';
    }
    if (payment.status === PaymentStatus.SUCCEEDED) {
      return 'deposited';
    }
    if (payment.status !== PaymentStatus.PENDING) {
      return 'failed';
    }

    const metadata = readArcaMetadata(payment.metadata);
    const lookup = metadata.arcaOrderId
      ? { orderId: metadata.arcaOrderId }
      : { orderNumber: payment.id };

    let statusResponse: ArcaOrderStatusResponse;
    try {
      statusResponse = await this.arcaClient.getOrderStatusExtended(lookup);
    } catch (error) {
      this.logger.error(
        `Arca status lookup failed for payment ${paymentId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return 'error';
    }

    const errorCode = Number(statusResponse.errorCode ?? -1);
    if (errorCode !== 0) {
      this.logger.warn(
        `Arca status error for ${paymentId}: ${statusResponse.errorMessage ?? errorCode}`,
      );
      return 'error';
    }

    const evaluation = evaluateArcaOrderStatus(statusResponse);
    if (evaluation === 'deposited') {
      return this.confirm(paymentId);
    }
    if (evaluation === 'failed') {
      await this.markFailed(paymentId, metadata.arcaOrderId);
      return 'failed';
    }

    // `in_progress` / `unknown`: leave PENDING so a later callback or cron run can resolve it.
    return 'in_progress';
  }

  private async confirm(paymentId: string): Promise<ArcaSyncOutcome> {
    try {
      await this.checkout.confirmPendingCardPayment(paymentId);
      return 'deposited';
    } catch (error) {
      this.logger.error(
        `Arca payment ${paymentId} is deposited but fulfillment failed`,
        error instanceof Error ? error.stack : String(error),
      );
      return 'error';
    }
  }

  private async markFailed(
    paymentId: string,
    arcaOrderId?: string,
  ): Promise<void> {
    const existing = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        metadata: true,
        status: true,
        source: true,
        sourceId: true,
      },
    });

    if (!existing || existing.status !== PaymentStatus.PENDING) {
      return;
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        confirmedAt: new Date(),
        paymentMethod: ManualPaymentMethod.CARD,
        ...(arcaOrderId
          ? {
              metadata: mergeArcaMetadata(existing.metadata, {
                provider: 'arca',
                arcaOrderId,
              }),
            }
          : {}),
      },
    });

    if (
      existing.source === PaymentSource.PACKAGE &&
      existing.sourceId !== null
    ) {
      await this.prisma.userPackage.updateMany({
        where: {
          id: existing.sourceId,
          status: UserPackageStatus.PENDING,
        },
        data: { status: UserPackageStatus.CANCELLED },
      });
    }
  }
}
