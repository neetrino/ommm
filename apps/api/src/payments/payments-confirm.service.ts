import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentSuccessEmailService } from './payment-success-email.service';
import { withInternalPaymentUpdateFields } from './payments.helpers';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import type {
  GiftEmailPayload,
  InternalPaymentRecord,
} from './payments.types';

@Injectable()
export class PaymentsConfirmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fulfillment: PaymentsFulfillmentService,
    private readonly paymentSuccessEmail: PaymentSuccessEmailService,
  ) {}

  async confirmPayment(
    paymentId: string,
    adminId: string | null,
    options?: { paymentMethod?: ManualPaymentMethod },
  ) {
    const giftEmails: GiftEmailPayload[] = [];
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = (await tx.payment.findUnique({
        where: { id: paymentId },
      })) as InternalPaymentRecord | null;
      if (!existing) {
        throw new NotFoundException('Payment not found');
      }
      if (existing.status !== PaymentStatus.PENDING) {
        throw new ConflictException('Only pending payments can be confirmed');
      }

      const giftEmail = await this.fulfillment.fulfillPaymentBySource(
        tx,
        existing,
      );
      if (giftEmail) {
        giftEmails.push(giftEmail);
      }

      return tx.payment.update({
        where: { id: paymentId },
        data: withInternalPaymentUpdateFields({
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          ...(adminId ? { confirmedByAdminId: adminId } : {}),
          ...(options?.paymentMethod
            ? { paymentMethod: options.paymentMethod }
            : {}),
        }),
      });
    });

    await this.dispatchGiftEmails(giftEmails);
    await this.fulfillment.emitDropInBookingRealtimeIfNeeded(payment);
    await this.paymentSuccessEmail.trySendSuccessEmails(
      payment.id,
      PaymentStatus.PENDING,
    );
    return payment;
  }

  private async dispatchGiftEmails(giftEmails: GiftEmailPayload[]): Promise<void> {
    for (const email of giftEmails) {
      await this.fulfillment.sendGiftCardEmail(email.to, email.code);
    }
  }
}
