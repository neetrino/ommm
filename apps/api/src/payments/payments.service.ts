import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ManualPaymentMethod } from '@prisma/client';
import { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import type { ListMyPaymentsQueryDto } from './dto/list-my-payments-query.dto';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';
import type { GiftPaymentMethod } from './dto/confirm-gift-payment.dto';
import { ArcaPaymentSyncService } from './arca/arca-payment-sync.service';
import type { ArcaSyncOutcome } from './arca/arca.types';
import { isArcaCheckoutEnabled } from './payment-arca.util';
import { PaymentCashPendingEmailService } from './payment-cash-pending-email.service';
import { PaymentsAdminService } from './payments-admin.service';
import { PaymentsCheckoutService } from './payments-checkout.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly config: ConfigService,
    private readonly checkout: PaymentsCheckoutService,
    private readonly admin: PaymentsAdminService,
    private readonly paymentCashPendingEmail: PaymentCashPendingEmailService,
    private readonly arcaSync: ArcaPaymentSyncService,
  ) {}

  /** Sends the branded cash-payment reminder email for a pending cash payment. */
  async notifyCashPaymentPending(paymentId: string): Promise<void> {
    await this.paymentCashPendingEmail.trySendCashPendingEmail(paymentId);
  }

  isArcaCheckoutEnabled(): boolean {
    return isArcaCheckoutEnabled(this.config);
  }

  createGiftCheckout(
    params: Parameters<PaymentsCheckoutService['createGiftCheckout']>[0],
  ) {
    return this.checkout.createGiftCheckout(params);
  }

  createDropInCheckout(userId: string, sessionId: string) {
    return this.checkout.createDropInCheckout(userId, sessionId);
  }

  confirmPendingCardPayment(paymentId: string): Promise<void> {
    return this.checkout.confirmPendingCardPayment(paymentId);
  }

  confirmDropInPayment(
    userId: string,
    paymentReference: string,
    paymentMethod: ManualPaymentMethod,
  ) {
    return this.checkout.confirmDropInPayment(
      userId,
      paymentReference,
      paymentMethod,
    );
  }

  confirmGiftPayment(
    userId: string,
    paymentReference: string,
    paymentMethod: GiftPaymentMethod,
  ) {
    return this.checkout.confirmGiftPayment(
      userId,
      paymentReference,
      paymentMethod,
    );
  }

  adminUpdatePaymentStatus(
    paymentId: string,
    status: AdminUpdatablePaymentStatus,
    adminId: string,
  ) {
    return this.admin.adminUpdatePaymentStatus(paymentId, status, adminId);
  }

  /** Re-checks a card payment against Arca and transitions it (admin on-demand). */
  async adminSyncArcaPayment(
    paymentId: string,
  ): Promise<{ outcome: ArcaSyncOutcome }> {
    const outcome = await this.arcaSync.syncPayment(paymentId);
    return { outcome };
  }

  listPayments(userId: string, query: ListMyPaymentsQueryDto = {}) {
    return this.admin.listPayments(userId, query);
  }

  getPaymentOutcomeByReference(userId: string, reference: string) {
    return this.admin.getPaymentOutcomeByReference(userId, reference);
  }

  adminListPayments(query: AdminListPaymentsQueryDto) {
    return this.admin.adminListPayments(query);
  }
}
