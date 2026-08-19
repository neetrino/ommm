import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentSource, PaymentStatus, Role } from '@prisma/client';
import type { AdminClientPackagePaymentMethod } from '../clients/dto/admin-purchase-client-package.dto';
import { toManualPaymentMethod } from '../payments/payment-revenue.util';
import { buildPackagePaymentDescription } from '../payments/payments-related-item.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPaymentReference,
  resolveFinalPriceCents,
} from './packages-plan.helpers';
import {
  assertPackageHasAvailableStock,
  decrementPackagePlanStock,
  packageHasPublicStock,
} from './packages-stock.helpers';
import { USER_PACKAGE_STATUS } from './packages-plan.types';
import { PackagesPublicService } from './packages-public.service';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';
import { buildUserPackagePlanSnapshot } from './user-package-plan-snapshot.util';
import { resolveUserPackagePeriodBounds } from './user-package-period.util';

/**
 * Admin Client Packages purchase — Cash / CARD_TERMINAL / INFLUENCER.
 * Immediate ACTIVE package + SUCCEEDED payment; no Arca.
 * Influencer stores catalog price as cost and never counts as cash revenue.
 */
@Injectable()
export class PackagesAdminClientPurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicPackages: PackagesPublicService,
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

    const now = new Date();
    const { currentPeriodStart, currentPeriodEnd } =
      resolveUserPackagePeriodBounds({
        planStartDate: plan.startDate,
        purchasedAt: now,
        periodDays: plan.periodDays,
      });
    const paymentReference = createPaymentReference('PACKAGE');
    const amountCents = resolveFinalPriceCents(plan);

    const created = await this.prisma.$transaction(async (tx) => {
      const userPackage = await tx.userPackage.create({
        data: {
          userId: params.clientId,
          planId: plan.id,
          ...buildUserPackagePlanSnapshot(plan),
          status: USER_PACKAGE_STATUS.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
          sessionsTotal: plan.isUnlimited ? null : (plan.sessionsPerMonth ?? 0),
          sessionsRemaining: plan.isUnlimited
            ? null
            : (plan.sessionsPerMonth ?? 0),
        },
      });
      await createBalancesForUserPackage(tx, {
        plan,
        userPackageId: userPackage.id,
      });
      const payment = await tx.payment.create({
        data: {
          userId: params.clientId,
          amountCents,
          currency: plan.currency.toLowerCase(),
          status: PaymentStatus.SUCCEEDED,
          paymentReference,
          source: PaymentSource.PACKAGE,
          sourceId: userPackage.id,
          description: buildPackagePaymentDescription(plan.name),
          confirmedAt: now,
          confirmedByAdminId: params.adminId,
          paymentMethod: toManualPaymentMethod(params.paymentMethod),
        },
      });
      await decrementPackagePlanStock(tx, plan.id);
      return {
        userPackageId: userPackage.id,
        paymentId: payment.id,
        amountCents: payment.amountCents,
        currency: payment.currency,
        stockTracked: plan.availableQuantity !== null,
      };
    });

    if (created.stockTracked) {
      await this.publicPackages.invalidatePublicPlansCache();
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
