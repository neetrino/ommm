import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponProductKind, Role, type PackagePlan } from '@prisma/client';
import type { AdminClientPackagePaymentMethod } from '../clients/dto/admin-purchase-client-package.dto';
import { COUPON_ERROR } from '../coupons/coupon.constants';
import { previewCouponCheckout } from '../coupons/coupon-preview.util';
import { quoteCoupon } from '../coupons/coupon-quote.util';
import type { CouponSnapshot } from '../coupons/coupon.types';
import { PaymentCashPendingEmailService } from '../payments/payment-cash-pending-email.service';
import { isStudioManualPaymentMethod } from '../payments/studio-manual-payment.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertPackageHasAvailableStock,
  packageHasPublicStock,
} from './packages-stock.helpers';
import { WhatsappPackagePurchasedService } from '../whatsapp/whatsapp-package-purchased.service';
import { PackagesPublicService } from './packages-public.service';
import { resolveFinalPriceCents } from './packages-plan.helpers';
import { createAdminClientPackagePurchaseTx } from './packages-admin-client-purchase.tx';

/**
 * Admin/Manager Client Packages purchase — Cash / CARD_TERMINAL / INFLUENCER.
 * Package is usable immediately. Studio methods stay unpaid until staff confirms.
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
    couponCode?: string;
  }) {
    await this.assertClient(params.clientId);
    const plan = await this.loadPurchasablePlan(params.planId);
    const coupon = await this.quotePackageCoupon({
      clientId: params.clientId,
      plan,
      paymentMethod: params.paymentMethod,
      couponCode: params.couponCode,
    });

    const isStudioMethod = isStudioManualPaymentMethod(params.paymentMethod);
    const created = await this.prisma.$transaction((tx) =>
      createAdminClientPackagePurchaseTx(tx, {
        adminId: params.adminId,
        clientId: params.clientId,
        plan,
        isStudioMethod,
        paymentMethod: params.paymentMethod,
        coupon,
      }),
    );

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
      couponCode: coupon?.code ?? null,
    };
  }

  /** Prices a code for this client and plan without reserving a use. */
  async previewCoupon(params: {
    clientId: string;
    planId: string;
    code: string;
  }) {
    await this.assertClient(params.clientId);
    const plan = await this.loadPurchasablePlan(params.planId);
    return previewCouponCheckout(this.prisma, {
      userId: params.clientId,
      code: params.code,
      subtotalCents: resolveFinalPriceCents(plan),
      lines: [{ kind: CouponProductKind.PACKAGE, packagePlanId: plan.id }],
      useGiftCredits: false,
    });
  }

  private async assertClient(clientId: string): Promise<void> {
    const client = await this.prisma.user.findFirst({
      where: { id: clientId, role: Role.USER },
      select: { id: true },
    });
    if (client === null) {
      throw new NotFoundException('Client not found');
    }
  }

  private async loadPurchasablePlan(planId: string): Promise<PackagePlan> {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: planId },
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
    return plan;
  }

  private async quotePackageCoupon(params: {
    clientId: string;
    plan: PackagePlan;
    paymentMethod: AdminClientPackagePaymentMethod;
    couponCode?: string;
  }): Promise<CouponSnapshot | null> {
    const code = params.couponCode?.trim();
    if (!code) {
      return null;
    }
    if (params.paymentMethod === 'INFLUENCER') {
      throw new BadRequestException(COUPON_ERROR.NOT_APPLICABLE);
    }
    const snapshot = await quoteCoupon(this.prisma, {
      userId: params.clientId,
      code,
      subtotalCents: resolveFinalPriceCents(params.plan),
      lines: [
        { kind: CouponProductKind.PACKAGE, packagePlanId: params.plan.id },
      ],
    });
    if (snapshot === null) {
      throw new BadRequestException(COUPON_ERROR.INVALID);
    }
    return snapshot;
  }
}
