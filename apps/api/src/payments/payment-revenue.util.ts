import { ManualPaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

export const INFLUENCER_PAYMENT_METHOD = 'INFLUENCER' as ManualPaymentMethod;

export function isInfluencerPaymentMethod(
  method: ManualPaymentMethod | null | undefined,
): boolean {
  return method === INFLUENCER_PAYMENT_METHOD;
}

export function toManualPaymentMethod(
  method: 'CASH' | 'CARD_TERMINAL' | 'INFLUENCER',
): ManualPaymentMethod {
  if (method === 'INFLUENCER') {
    return INFLUENCER_PAYMENT_METHOD;
  }
  return method;
}

export function isRevenueSucceededPayment(payment: {
  status: PaymentStatus;
  paymentMethod: ManualPaymentMethod | null;
}): boolean {
  return (
    payment.status === PaymentStatus.SUCCEEDED &&
    !isInfluencerPaymentMethod(payment.paymentMethod)
  );
}

/** Succeeded cash revenue — excludes influencer comps. */
export const revenueSucceededWhere: Prisma.PaymentWhereInput = {
  status: PaymentStatus.SUCCEEDED,
  NOT: { paymentMethod: INFLUENCER_PAYMENT_METHOD },
};

export const influencerSucceededWhere: Prisma.PaymentWhereInput = {
  status: PaymentStatus.SUCCEEDED,
  paymentMethod: INFLUENCER_PAYMENT_METHOD,
};

export function summarizeInfluencerCost(
  payments: Array<{
    status: PaymentStatus;
    paymentMethod: ManualPaymentMethod | null | undefined;
    amountCents: number;
  }>,
): { count: number; costCents: number } {
  let count = 0;
  let costCents = 0;
  for (const payment of payments) {
    if (
      payment.status !== PaymentStatus.SUCCEEDED ||
      !isInfluencerPaymentMethod(payment.paymentMethod)
    ) {
      continue;
    }
    count += 1;
    costCents += payment.amountCents;
  }
  return { count, costCents };
}
