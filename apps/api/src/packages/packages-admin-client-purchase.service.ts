import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { AdminClientPackagePaymentMethod } from '../clients/dto/admin-purchase-client-package.dto';
import { PaymentCashPendingEmailService } from '../payments/payment-cash-pending-email.service';
import { isStudioManualPaymentMethod } from '../payments/studio-manual-payment.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertPackageHasAvailableStock,
  packageHasPublicStock,
} from './packages-stock.helpers';
import { WhatsappPackagePurchasedService } from '../whatsapp/whatsapp-package-purchased.service';
import { PackagesPublicService } from './packages-public.service';
import { createAdminClientPackagePurchaseTx } from './packages-admin-client-purchase.tx';

/**
 * Admin/Manager Client Packages purchase — Cash / CARD_TERMINAL / INFLUENCER.
 * Studio methods stay unpaid until staff confirms. Influencer is immediate.
 */
@Injectable()
export class PackagesAdminClientPurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicPackages: PackagesPublicService,
    private readonly packagePurchased: WhatsappPackagePurchasedService,
    private readonly paymentCashPendingEmail: PaymentCashPendingEmailService,
  ) {}

  async purchase(params: {
    adminId: string;
    clientId: string;
    planId: string;
    paymentMethod: AdminClientPackagePaymentMethod;
  }) {
    const client = await this.prisma.user.findFirst({
      where: { id: params.clientId, role: Role.USER },
      select: { id: true },
    });
    if (client === null) {
      throw new NotFoundException('Client not found');
    }

    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: params.planId },
    });
    if (
      plan === null ||
      !plan.isActive ||
      plan.priceCents <= 0 ||
      !packageHasPublicStock(plan)
    ) {
      throw new NotFoundException('Package plan not found');
    }
    assertPackageHasAvailableStock(plan);

    const isStudioMethod = isStudioManualPaymentMethod(params.paymentMethod);
    const created = await this.prisma.$transaction((tx) =>
      createAdminClientPackagePurchaseTx(tx, {
        adminId: params.adminId,
        clientId: params.clientId,
        plan,
        isStudioMethod,
        paymentMethod: params.paymentMethod,
      }),
    );

    // Studio methods decrement stock only on confirmPayment, which invalidates
    // the public plans cache after fulfillPackagePayment.
    if (created.stockTracked) {
      await this.publicPackages.invalidatePublicPlansCache();
    }
    if (isStudioMethod) {
      await this.paymentCashPendingEmail.trySendCashPendingEmail(
        created.paymentId,
      );
    } else {
      await this.packagePurchased.tryNotify(created.userPackageId);
    }

    return {
      userPackageId: created.userPackageId,
      paymentId: created.paymentId,
      planId: plan.id,
      paymentMethod: params.paymentMethod,
      amountCents: created.amountCents,
      currency: created.currency,
    };
  }
}
