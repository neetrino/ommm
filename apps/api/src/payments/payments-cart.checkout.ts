import { Injectable } from '@nestjs/common';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCartCheckoutDto } from './dto/create-cart-checkout.dto';
import { createPaymentReference, withInternalPaymentCreateFields, withInternalPaymentUpdateFields } from './payments.helpers';
import { loadCartLines } from './payments-cart.load';
import { fulfillStudioCart } from './payments-cart.fulfill';
import { CART_CHECKOUT_KIND, quoteStudioCart } from './payments-cart.quote';
import { INTERNAL_PAYMENT_SOURCE } from './payments.types';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';

@Injectable()
export class PaymentsCartCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fulfillment: PaymentsFulfillmentService,
  ) {}

  async create(userId: string, dto: CreateCartCheckoutDto) {
    const lines = await loadCartLines(this.prisma, userId, dto);
    const quote = quoteStudioCart({
      packageCents: lines.packageCents,
      sessionCents: lines.sessionCents,
      barCents: lines.barCents,
      classSessionsAvailable: lines.classSessionsAvailable,
      spendableGiftCents: lines.spendableGiftCents,
      useGiftCredits: dto.useGiftCredits === true,
      hasSession: lines.sessionId !== null,
    });
    const metadata = {
      checkoutKind: CART_CHECKOUT_KIND,
      packagePlanId: lines.packagePlanId ?? undefined,
      sessionId: lines.sessionId ?? undefined,
      classTypeId: lines.classTypeId ?? undefined,
      barProductId: lines.barProductId ?? undefined,
      classSessionsCovered: quote.classSessionsCovered,
      giftCreditsAppliedCents: quote.appliedGiftCents > 0 ? quote.appliedGiftCents : undefined,
    };
    if (quote.chargeCents === 0) {
      return this.settleCovered(userId, metadata);
    }
    return this.prisma.payment.create({
      data: withInternalPaymentCreateFields({
        userId,
        amountCents: quote.chargeCents,
        currency: 'amd',
        status: PaymentStatus.PENDING,
        paymentReference: createPaymentReference('CART'),
        source: INTERNAL_PAYMENT_SOURCE.OTHER,
        description: 'Studio cart',
        metadata,
      }),
    });
  }

  private async settleCovered(
    userId: string,
    metadata: Record<string, string | number | undefined>,
  ) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: withInternalPaymentCreateFields({
          userId,
          amountCents: 0,
          currency: 'amd',
          status: PaymentStatus.PENDING,
          paymentReference: createPaymentReference('CART'),
          source: INTERNAL_PAYMENT_SOURCE.OTHER,
          description: 'Studio cart',
          metadata,
        }),
      });
      await fulfillStudioCart(tx, created, this.fulfillment);
      return tx.payment.update({
        where: { id: created.id },
        data: withInternalPaymentUpdateFields({
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          paymentMethod: ManualPaymentMethod.CARD,
        }),
      });
    });
    await this.fulfillment.emitDropInBookingRealtimeIfNeeded(payment);
    return payment;
  }
}
