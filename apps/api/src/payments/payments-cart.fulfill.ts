import type { Prisma } from '@prisma/client';
import { reserveGiftClassSessions } from '../gift-cards/gift-card-class-credit';
import { reservePendingDropInGift } from './payments-dropin-gift';
import { CART_CHECKOUT_KIND } from './payments-cart.quote';

export type CartCheckoutMeta = {
  checkoutKind: typeof CART_CHECKOUT_KIND;
  packagePlanId?: string;
  sessionId?: string;
  classTypeId?: string;
  barProductId?: string;
  classSessionsCovered: number;
  giftCreditsAppliedCents?: number;
};

type CartPayment = {
  id: string;
  userId: string;
  metadata?: Prisma.JsonValue | null;
};

type CartPorts = {
  fulfillDropInPayment: (
    tx: Prisma.TransactionClient,
    userId: string,
    sessionId: string | null,
  ) => Promise<void>;
  fulfillPackagePayment: (
    tx: Prisma.TransactionClient,
    payment: {
      id: string;
      userId: string;
      sourceId: string | null;
      metadata: Prisma.JsonValue | null;
    },
  ) => Promise<boolean>;
};

export function readCartCheckout(
  value: Prisma.JsonValue | null,
): CartCheckoutMeta | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (record.checkoutKind !== CART_CHECKOUT_KIND) {
    return null;
  }
  return {
    checkoutKind: CART_CHECKOUT_KIND,
    packagePlanId: readId(record.packagePlanId),
    sessionId: readId(record.sessionId),
    classTypeId: readId(record.classTypeId),
    barProductId: readId(record.barProductId),
    classSessionsCovered: readCount(record.classSessionsCovered),
    giftCreditsAppliedCents: readCount(record.giftCreditsAppliedCents),
  };
}

/** Books the class, activates the package, and debits gift credit for one cart payment. */
export async function fulfillStudioCart(
  tx: Prisma.TransactionClient,
  payment: CartPayment,
  ports: CartPorts,
): Promise<void> {
  const cart = readCartCheckout(payment.metadata ?? null);
  if (cart === null) {
    return;
  }
  await reservePendingDropInGift(
    tx,
    {
      id: payment.id,
      userId: payment.userId,
      metadata: payment.metadata ?? null,
    },
    'studio cart',
  );
  await reserveCoveredClass(tx, payment, cart);
  if (cart.sessionId) {
    await ports.fulfillDropInPayment(tx, payment.userId, cart.sessionId);
  }
  if (cart.packagePlanId) {
    await ports.fulfillPackagePayment(tx, {
      id: payment.id,
      userId: payment.userId,
      sourceId: null,
      metadata: { planId: cart.packagePlanId },
    });
  }
}

async function reserveCoveredClass(
  tx: Prisma.TransactionClient,
  payment: CartPayment,
  cart: CartCheckoutMeta,
): Promise<void> {
  if (cart.classSessionsCovered <= 0 || !cart.classTypeId) {
    return;
  }
  await reserveGiftClassSessions(tx, {
    userId: payment.userId,
    classTypeId: cart.classTypeId,
    sessions: cart.classSessionsCovered,
    orderId: payment.id,
  });
}

function readId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readCount(value: unknown): number {
  return typeof value === 'number' && value > 0 ? value : 0;
}
