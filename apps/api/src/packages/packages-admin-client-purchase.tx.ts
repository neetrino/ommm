import {
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type PackagePlan,
  type Prisma,
} from '@prisma/client';
import { mergeArcaMetadata } from '../payments/arca/arca-metadata.util';
import { PAYMENT_STATUS_REASON } from '../payments/payment-status-reason';
import { toManualPaymentMethod } from '../payments/payment-revenue.util';
import { buildPackagePaymentDescription } from '../payments/payments-related-item.util';
import { bindCouponRedemption } from '../coupons/coupon-redemption.util';
import type { CouponSnapshot } from '../coupons/coupon.types';
import { STUDIO_PACKAGE_FULFILLED_KEY } from './package-payment-metadata.util';
import {
  createPaymentReference,
  resolveFinalPriceCents,
} from './packages-plan.helpers';
import { decrementPackagePlanStock } from './packages-stock.helpers';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';
import { buildUserPackageCreateData } from './packages-subscribe-card.util';

/** Staff-assigned packages are usable immediately; studio payment can stay PENDING. */
export async function createAdminClientPackagePurchaseTx(
  tx: Prisma.TransactionClient,
  params: {
    adminId: string;
    clientId: string;
    plan: PackagePlan;
    isStudioMethod: boolean;
    paymentMethod: 'CASH' | 'CARD_TERMINAL' | 'INFLUENCER';
    coupon: CouponSnapshot | null;
  },
): Promise<{
  userPackageId: string;
  paymentId: string;
  amountCents: number;
  currency: string;
  stockTracked: boolean;
}> {
  const userPackage = await tx.userPackage.create({
    data: buildUserPackageCreateData({
      userId: params.clientId,
      plan: params.plan,
      status: UserPackageStatus.ACTIVE,
    }),
  });
  await createBalancesForUserPackage(tx, {
    plan: params.plan,
    userPackageId: userPackage.id,
  });
  const payment = await createStaffPackagePayment(tx, params, userPackage.id);
  await decrementPackagePlanStock(tx, params.plan.id);
  return {
    userPackageId: userPackage.id,
    paymentId: payment.id,
    amountCents: payment.amountCents,
    currency: payment.currency,
    stockTracked: params.plan.availableQuantity !== null,
  };
}

async function createStaffPackagePayment(
  tx: Prisma.TransactionClient,
  params: {
    adminId: string;
    clientId: string;
    plan: PackagePlan;
    isStudioMethod: boolean;
    paymentMethod: 'CASH' | 'CARD_TERMINAL' | 'INFLUENCER';
    coupon: CouponSnapshot | null;
  },
  userPackageId: string,
) {
  const now = new Date();
  const amountCents =
    params.coupon?.amountAfterCouponCents ??
    resolveFinalPriceCents(params.plan);
  const payment = await tx.payment.create({
    data: {
      userId: params.clientId,
      amountCents,
      currency: params.plan.currency.toLowerCase(),
      status: params.isStudioMethod
        ? PaymentStatus.PENDING
        : PaymentStatus.SUCCEEDED,
      paymentReference: createPaymentReference('PACKAGE'),
      source: PaymentSource.PACKAGE,
      sourceId: userPackageId,
      description: buildPackagePaymentDescription(params.plan.name),
      confirmedAt: params.isStudioMethod ? null : now,
      confirmedByAdminId: params.isStudioMethod ? null : params.adminId,
      paymentMethod: toManualPaymentMethod(params.paymentMethod),
      ...(params.isStudioMethod
        ? {
            metadata: mergeArcaMetadata(null, {
              statusReason: PAYMENT_STATUS_REASON.AWAITING_CASH,
              [STUDIO_PACKAGE_FULFILLED_KEY]: true,
            }),
          }
        : {}),
    },
  });
  if (params.coupon !== null) {
    await bindCouponRedemption(tx, {
      userId: params.clientId,
      paymentId: payment.id,
      snapshot: params.coupon,
      applyNow: !params.isStudioMethod,
    });
  }
  return payment;
}
