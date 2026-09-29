import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ManualPaymentMethod } from '@prisma/client';
import { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import type { CreateCartCheckoutDto } from './dto/create-cart-checkout.dto';
import type { ListMyPaymentsQueryDto } from './dto/list-my-payments-query.dto';
import type { AdminUpdatablePaymentMethod } from './dto/admin-update-payment-method.dto';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';
import type { GiftPaymentMethod } from './dto/confirm-gift-payment.dto';
import { ArcaPaymentSyncService } from './arca/arca-payment-sync.service';
import type { ArcaSyncOutcome } from './arca/arca.types';
import { isArcaCheckoutEnabled } from './payment-arca.util';
import { PaymentCashPendingEmailService } from './payment-cash-pending-email.service';
import { PaymentsAdminMutationService } from './payments-admin-mutation.service';
import { PaymentsAdminService } from './payments-admin.service';
import { PaymentsCheckoutService } from './payments-checkout.service';
import { PaymentsCartCheckoutService } from './payments-cart.checkout';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly config: ConfigService,
    private readonly checkout: PaymentsCheckoutService,
    private readonly cart: PaymentsCartCheckoutService,
    private readonly admin: PaymentsAdminService,
    private readonly adminMutation: PaymentsAdminMutationService,
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

  createDropInCheckout(userId: string, sessionId: string, useGiftCredits = false) {
    return this.checkout.createDropInCheckout(userId, sessionId, useGiftCredits);
  }

  createCartCheckout(userId: string, dto: CreateCartCheckoutDto) {
    return this.cart.create(userId, dto);
  }

  dispatchDueGiftEmails(): Promise<number> {
    return this.checkout.dispatchDueGiftEmails();
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
    return this.adminMutation.adminUpdatePaymentStatus(
      paymentId,
      status,
      adminId,
    );
  }

  adminUpdatePaymentMethod(
    paymentId: string,
    paymentMethod: AdminUpdatablePaymentMethod,
    adminId: string,
  ) {
    return this.adminMutation.adminUpdatePaymentMethod(
      paymentId,
      paymentMethod,
      adminId,
    );
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
