import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';
import { PackagesPublicService } from '../packages/packages-public.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappPackagePurchasedService } from '../whatsapp/whatsapp-package-purchased.service';
import { PaymentSuccessEmailService } from './payment-success-email.service';
import { EhdmReceiptService } from './ehdm/ehdm-receipt.service';
import { withInternalPaymentUpdateFields } from './payments.helpers';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';
import type { GiftEmailPayload, InternalPaymentRecord } from './payments.types';

@Injectable()
export class PaymentsConfirmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fulfillment: PaymentsFulfillmentService,
    private readonly paymentSuccessEmail: PaymentSuccessEmailService,
    private readonly ehdmReceipt: EhdmReceiptService,
    @Inject(forwardRef(() => PackagesPublicService))
    private readonly packagesPublic: PackagesPublicService,
    private readonly packagePurchased: WhatsappPackagePurchasedService,
  ) {}

  async confirmPayment(
    paymentId: string,
    adminId: string | null,
    options?: { paymentMethod?: ManualPaymentMethod },
  ) {
    const giftEmails: GiftEmailPayload[] = [];
    let packageStockTracked = false;
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

      const fulfillment = await this.fulfillment.fulfillPaymentBySource(
        tx,
        existing,
      );
      if (fulfillment.giftEmail) {
        giftEmails.push(fulfillment.giftEmail);
      }
      packageStockTracked = fulfillment.packageStockTracked;

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
    if (packageStockTracked) {
      await this.packagesPublic.invalidatePublicPlansCache();
    }
    await this.fulfillment.emitDropInBookingRealtimeIfNeeded(payment);
    await this.paymentSuccessEmail.trySendSuccessEmails(
      payment.id,
      PaymentStatus.PENDING,
    );
    if (payment.source === PaymentSource.PACKAGE && payment.sourceId) {
      await this.packagePurchased.tryNotify(payment.sourceId);
    }
    this.ehdmReceipt.tryPrintReceipt(payment.id, PaymentStatus.PENDING);
    return payment;
  }

  private async dispatchGiftEmails(
    giftEmails: GiftEmailPayload[],
  ): Promise<void> {
    for (const email of giftEmails) {
      await this.fulfillment.sendGiftCardEmail(email.to, email.code);
    }
  }
}
