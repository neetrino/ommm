import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PACKAGE_GIFT_CREDITS_REFUNDED_KEY,
  readGiftCreditsAppliedCents,
  refundReservedGiftCredits,
  wereGiftCreditsRefunded,
} from '../packages/package-gift-credits.util';
import type { AdminUpdatablePaymentMethod } from './dto/admin-update-payment-method.dto';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';
import { mergeArcaMetadata } from './arca/arca-metadata.util';
import { EhdmReceiptService } from './ehdm/ehdm-receipt.service';
import { PAYMENT_STATUS_REASON } from './payment-status-reason';
import { PaymentsCheckoutService } from './payments-checkout.service';
import {
  assertAdminPaymentMethodChange,
  assertAdminPaymentStatusChange,
} from './payments-admin-mutation.util';
import { withInternalPaymentUpdateFields } from './payments.helpers';

@Injectable()
export class PaymentsAdminMutationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkout: PaymentsCheckoutService,
    private readonly ehdmReceipt: EhdmReceiptService,
  ) {}

  async adminUpdatePaymentStatus(
    paymentId: string,
    status: AdminUpdatablePaymentStatus,
    actorId: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    assertAdminPaymentStatusChange({
      paymentMethod: payment.paymentMethod,
      current: payment.status,
      next: status,
    });
    if (payment.status === status) {
      return payment;
    }
    if (
      status === PaymentStatus.SUCCEEDED &&
      payment.status === PaymentStatus.PENDING
    ) {
      return this.checkout.confirmPayment(paymentId, actorId, {
        paymentMethod: payment.paymentMethod ?? ManualPaymentMethod.CASH,
      });
    }
    return this.persistNonConfirmStatus(payment, status, actorId);
  }

  async adminUpdatePaymentMethod(
    paymentId: string,
    paymentMethod: AdminUpdatablePaymentMethod,
    _actorId: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    assertAdminPaymentMethodChange({
      current: payment.paymentMethod,
      next: paymentMethod,
    });
    if (payment.paymentMethod === paymentMethod) {
      return payment;
    }
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: withInternalPaymentUpdateFields({
        paymentMethod,
      }),
    });
  }

  private async persistNonConfirmStatus(
    payment: {
      id: string;
      status: PaymentStatus;
      source: PaymentSource;
      sourceId: string | null;
      userId: string;
      metadata: Prisma.JsonValue;
      confirmedAt: Date | null;
    },
    status: AdminUpdatablePaymentStatus,
    actorId: string,
  ) {
    if (status === PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Succeeded status must go through confirm');
    }
    const previousStatus = payment.status;
    const shouldRefundGifts = shouldRefundReservedGiftCredits(
      payment.metadata,
      status,
    );
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: withInternalPaymentUpdateFields({
        status,
        confirmedAt:
          status === PaymentStatus.PENDING
            ? null
            : (payment.confirmedAt ?? new Date()),
        confirmedByAdminId: actorId,
        metadata: nextStatusMetadata(payment.metadata, status, shouldRefundGifts),
      }),
    });
    await this.applyPackageStatusSideEffects({
      source: payment.source,
      sourceId: payment.sourceId,
      userId: payment.userId,
      metadata: payment.metadata,
      previousStatus,
      nextStatus: status,
      refundGiftCredits: shouldRefundGifts,
    });
    if (status === PaymentStatus.REFUNDED) {
      this.ehdmReceipt.tryPrintReturnReceipt(updated.id);
    }
    return updated;
  }

  private async applyPackageStatusSideEffects(params: {
    source: PaymentSource;
    sourceId: string | null;
    userId: string;
    metadata: Prisma.JsonValue;
    previousStatus: PaymentStatus;
    nextStatus: PaymentStatus;
    refundGiftCredits: boolean;
  }): Promise<void> {
    if (params.source !== PaymentSource.PACKAGE || params.sourceId === null) {
      return;
    }
    if (
      params.nextStatus === PaymentStatus.REFUNDED ||
      params.nextStatus === PaymentStatus.FAILED
    ) {
      await this.setLinkedPackageStatus(
        params.sourceId,
        UserPackageStatus.CANCELLED,
      );
      if (params.refundGiftCredits) {
        await refundReservedGiftCredits(this.prisma, {
          userId: params.userId,
          appliedCents: readGiftCreditsAppliedCents(params.metadata),
        });
      }
      return;
    }
    if (
      params.previousStatus === PaymentStatus.SUCCEEDED &&
      params.nextStatus === PaymentStatus.PENDING
    ) {
      await this.setLinkedPackageStatus(
        params.sourceId,
        UserPackageStatus.PENDING,
      );
    }
  }

  private async setLinkedPackageStatus(
    userPackageId: string,
    status: UserPackageStatus,
  ): Promise<void> {
    await this.prisma.userPackage.updateMany({
      where: {
        id: userPackageId,
        status: {
          in: [
            UserPackageStatus.ACTIVE,
            UserPackageStatus.PAUSED,
            UserPackageStatus.PENDING,
          ],
        },
      },
      data: { status },
    });
  }
}

function shouldRefundReservedGiftCredits(
  metadata: Prisma.JsonValue,
  status: AdminUpdatablePaymentStatus,
): boolean {
  if (
    status !== PaymentStatus.FAILED &&
    status !== PaymentStatus.REFUNDED
  ) {
    return false;
  }
  if (wereGiftCreditsRefunded(metadata)) {
    return false;
  }
  return readGiftCreditsAppliedCents(metadata) > 0;
}

function nextStatusMetadata(
  metadata: Prisma.JsonValue,
  status: AdminUpdatablePaymentStatus,
  shouldRefundGifts: boolean,
): Prisma.InputJsonValue {
  return mergeArcaMetadata(metadata, {
    ...(status === PaymentStatus.FAILED
      ? { statusReason: PAYMENT_STATUS_REASON.ADMIN_REJECTED }
      : {}),
    ...(status === PaymentStatus.PENDING
      ? { statusReason: PAYMENT_STATUS_REASON.AWAITING_CASH }
      : {}),
    ...(shouldRefundGifts ? { [PACKAGE_GIFT_CREDITS_REFUNDED_KEY]: true } : {}),
  });
}
