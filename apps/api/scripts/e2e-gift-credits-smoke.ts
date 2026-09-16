/**
 * Dev E2E smoke: gift cards stay separate, nearest-expiry spend, refund to cards.
 * Hits local API + Prisma. Safe for local/dev DB only.
 *
 * Run from repo root:
 *   dotenv -o -e .env -- pnpm exec tsx apps/api/scripts/e2e-gift-credits-smoke.ts
 */
import {
  GiftCardStatus,
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  PrismaClient,
  Role,
  UserPackageStatus,
} from '@prisma/client';
import { hashPassword } from '../src/common/password-crypto';
import {
  readGiftCreditsAllocations,
  readGiftCreditsAppliedCents,
  refundReservedGiftCredits,
} from '../src/packages/package-gift-credits.util';

const prisma = new PrismaClient();
const API_BASE = (
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:4000'
).replace(/\/$/, '');
const API = API_BASE.endsWith('/v1') ? API_BASE : `${API_BASE}/v1`;
const MARKER = 'E2EGIFT';
const PASSWORD = 'GiftTestPass123!';

type Json = Record<string, unknown>;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function apiJson<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const response = await fetch(`${API}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(
      `${options.method ?? 'GET'} ${path} → ${response.status}: ${text.slice(0, 400)}`,
    );
  }
  return data as T;
}

async function cleanup(userId: string | null, cardIds: string[]) {
  if (cardIds.length > 0) {
    await prisma.giftCard.deleteMany({ where: { id: { in: cardIds } } });
  }
  if (userId === null) {
    return;
  }
  const packages = await prisma.userPackage.findMany({
    where: { userId },
    select: { id: true },
  });
  const packageIds = packages.map((row) => row.id);
  if (packageIds.length > 0) {
    await prisma.payment.deleteMany({
      where: {
        OR: [
          { userId, source: PaymentSource.PACKAGE },
          { userId, source: PaymentSource.OTHER, sourceId: { in: packageIds } },
        ],
      },
    });
    await prisma.userPackageBalance.deleteMany({
      where: { userPackageId: { in: packageIds } },
    });
    await prisma.userPackage.deleteMany({ where: { id: { in: packageIds } } });
  } else {
    await prisma.payment.deleteMany({ where: { userId } });
  }
  await prisma.giftCard.deleteMany({
    where: {
      OR: [{ recipientId: userId }, { purchaserId: userId }, { code: { startsWith: MARKER } }],
    },
  });
  await prisma.user.deleteMany({ where: { id: userId } });
}

async function main() {
  const stamp = Date.now().toString(36).toUpperCase();
  const email = `gift.e2e.${stamp}@example.com`.toLowerCase();
  let userId: string | null = null;
  const createdCardIds: string[] = [];

  console.log(`API: ${API}`);
  console.log(`User: ${email}`);

  try {
    const passwordHash = await hashPassword(PASSWORD);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Gift',
        lastName: 'Tester',
        phone: `+3749${String(Date.now()).slice(-7)}`,
        role: Role.USER,
        emailVerified: new Date(),
      },
    });
    userId = user.id;

    const loggedIn = await apiJson<{
      user: { id: string };
      accessToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: { email, password: PASSWORD },
    });
    const token = loggedIn.accessToken;

    const soonCode = `${MARKER}${stamp}A`;
    const laterCode = `${MARKER}${stamp}B`;
    const soon = await prisma.giftCard.create({
      data: {
        code: soonCode,
        amountAmd: 5_000,
        balanceAmd: 5_000,
        status: GiftCardStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
    const later = await prisma.giftCard.create({
      data: {
        code: laterCode,
        amountAmd: 8_000,
        balanceAmd: 8_000,
        status: GiftCardStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    createdCardIds.push(soon.id, later.id);

    const walletBefore = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { giftCreditsCents: true },
    });

    const redeemSoon = await apiJson<{
      ok: boolean;
      creditedCents: number;
      alreadyOwned?: boolean;
    }>('/gift-cards/redeem', {
      method: 'POST',
      token,
      body: { code: soonCode },
    });
    assert(redeemSoon.ok === true, 'redeem soon failed');
    assert(redeemSoon.creditedCents === 5_000, 'soon credited mismatch');

    const redeemLater = await apiJson<{ ok: boolean; creditedCents: number }>(
      '/gift-cards/redeem',
      {
        method: 'POST',
        token,
        body: { code: laterCode },
      },
    );
    assert(redeemLater.ok === true, 'redeem later failed');

    const walletAfterRedeem = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { giftCreditsCents: true },
    });
    assert(
      walletAfterRedeem.giftCreditsCents === walletBefore.giftCreditsCents,
      `wallet must not change on redeem (was ${walletBefore.giftCreditsCents}, now ${walletAfterRedeem.giftCreditsCents})`,
    );

    const soonAfter = await prisma.giftCard.findUniqueOrThrow({
      where: { id: soon.id },
    });
    assert(soonAfter.status === GiftCardStatus.ACTIVE, 'soon must stay ACTIVE');
    assert(soonAfter.balanceAmd === 5_000, 'soon balance must remain');
    assert(soonAfter.recipientId === userId, 'soon recipient must be set');

    const spendable = await apiJson<{ spendableCents: number }>(
      '/gift-cards/me/spendable-balance',
      { token },
    );
    assert(
      spendable.spendableCents === 13_000,
      `spendable expected 13000, got ${spendable.spendableCents}`,
    );

    const received = await apiJson<Array<{ id: string; status: string }>>(
      '/gift-cards/me/received',
      { token },
    );
    assert(
      received.some((card) => card.id === soon.id),
      'soon card missing from received',
    );
    assert(
      received.some((card) => card.id === later.id),
      'later card missing from received',
    );

    const plan = await prisma.packagePlan.findFirst({
      where: {
        isActive: true,
        priceCents: { gt: 0, lte: 13_000 },
        OR: [
          { availableQuantity: null },
          { availableQuantity: { gt: 0 } },
        ],
      },
      orderBy: { priceCents: 'asc' },
    });
    assert(plan !== null, 'no active package plan <= 13000 found');

    const finalPrice =
      plan.discountedPriceCents !== null &&
      plan.discountedPriceCents >= 0 &&
      plan.discountedPriceCents < plan.priceCents
        ? plan.discountedPriceCents
        : plan.priceCents;
    assert(finalPrice > 0, 'plan price must be > 0');
    assert(
      spendable.spendableCents >= finalPrice,
      `need gift balance >= plan price (${finalPrice}); have ${spendable.spendableCents}`,
    );

    const subscribe = await apiJson<Json>('/packages/me/subscribe', {
      method: 'POST',
      token,
      body: {
        planId: plan.id,
        paymentMethod: ManualPaymentMethod.CASH,
        useGiftCredits: true,
      },
    });
    console.log('subscribe ok', {
      keys: Object.keys(subscribe),
      chargeCents: subscribe.chargeCents,
      paymentId: subscribe.paymentId,
    });

    const soonSpent = await prisma.giftCard.findUniqueOrThrow({
      where: { id: soon.id },
    });
    const laterSpent = await prisma.giftCard.findUniqueOrThrow({
      where: { id: later.id },
    });

    if (finalPrice <= 5_000) {
      assert(
        soonSpent.balanceAmd === 5_000 - finalPrice,
        `soon should be partially debited first (balance=${soonSpent.balanceAmd})`,
      );
      assert(
        laterSpent.balanceAmd === 8_000,
        'later must be untouched when soon covers price',
      );
      if (finalPrice === 5_000) {
        assert(
          soonSpent.status === GiftCardStatus.REDEEMED,
          'soon must be REDEEMED when fully spent',
        );
      } else {
        assert(
          soonSpent.status === GiftCardStatus.ACTIVE,
          'soon must stay ACTIVE when partially spent',
        );
      }
    } else {
      assert(
        soonSpent.balanceAmd === 0 &&
          soonSpent.status === GiftCardStatus.REDEEMED,
        'soon must be fully spent first',
      );
      assert(
        laterSpent.balanceAmd === 8_000 - (finalPrice - 5_000),
        `later partial debit mismatch (balance=${laterSpent.balanceAmd})`,
      );
    }

    const packagePayment = await prisma.payment.findFirst({
      where: {
        userId,
        source: PaymentSource.PACKAGE,
      },
      orderBy: { createdAt: 'desc' },
    });
    assert(packagePayment !== null, 'package payment missing');
    const applied = readGiftCreditsAppliedCents(packagePayment.metadata);
    const allocations = readGiftCreditsAllocations(packagePayment.metadata);
    assert(applied === Math.min(finalPrice, 13_000), `applied cents=${applied}`);
    assert(allocations !== null && allocations.length > 0, 'allocations missing');
    assert(
      allocations[0]?.cardId === soon.id,
      `first allocation must be soon card, got ${allocations[0]?.cardId}`,
    );

    await refundReservedGiftCredits(prisma, {
      userId,
      appliedCents: applied,
      allocations,
    });
    await prisma.payment.update({
      where: { id: packagePayment.id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: {
          ...(typeof packagePayment.metadata === 'object' &&
          packagePayment.metadata !== null &&
          !Array.isArray(packagePayment.metadata)
            ? (packagePayment.metadata as Json)
            : {}),
          giftCreditsRefunded: true,
        },
      },
    });
    if (packagePayment.sourceId) {
      await prisma.userPackage.updateMany({
        where: { id: packagePayment.sourceId },
        data: { status: UserPackageStatus.CANCELLED },
      });
    }

    const soonRefunded = await prisma.giftCard.findUniqueOrThrow({
      where: { id: soon.id },
    });
    const laterRefunded = await prisma.giftCard.findUniqueOrThrow({
      where: { id: later.id },
    });
    assert(
      soonRefunded.balanceAmd === 5_000 &&
        soonRefunded.status === GiftCardStatus.ACTIVE,
      `soon not restored (balance=${soonRefunded.balanceAmd}, status=${soonRefunded.status})`,
    );
    assert(
      laterRefunded.balanceAmd === 8_000 &&
        laterRefunded.status === GiftCardStatus.ACTIVE,
      `later not restored (balance=${laterRefunded.balanceAmd}, status=${laterRefunded.status})`,
    );

    const spendableAfterRefund = await apiJson<{ spendableCents: number }>(
      '/gift-cards/me/spendable-balance',
      { token },
    );
    assert(
      spendableAfterRefund.spendableCents === 13_000,
      `spendable after refund expected 13000, got ${spendableAfterRefund.spendableCents}`,
    );

    // Task #2: unused/purchased gift payment cannot be cash-refunded by admin.
    const giftPurchase = await prisma.payment.create({
      data: {
        userId,
        amountCents: 5_000,
        currency: 'amd',
        status: PaymentStatus.SUCCEEDED,
        source: PaymentSource.GIFT,
        paymentMethod: ManualPaymentMethod.CARD,
        confirmedAt: new Date(),
        description: `${MARKER} gift purchase non-refundable check`,
      },
    });
    const adminPassword = 'GiftAdminPass123!';
    const adminEmail = `gift.admin.${stamp}@example.com`.toLowerCase();
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        name: 'Gift',
        lastName: 'Admin',
        phone: `+37477${String(Date.now()).slice(-6)}`,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    const adminLogin = await apiJson<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: adminPassword },
    });
    let refused = false;
    try {
      await apiJson(`/payments/admin/${giftPurchase.id}/status`, {
        method: 'PATCH',
        token: adminLogin.accessToken,
        body: { status: PaymentStatus.REFUNDED },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      refused = message.includes('non-refundable') || message.includes('400');
    }
    assert(refused, 'admin gift purchase refund must be rejected');
    const giftPurchaseAfter = await prisma.payment.findUniqueOrThrow({
      where: { id: giftPurchase.id },
    });
    assert(
      giftPurchaseAfter.status === PaymentStatus.SUCCEEDED,
      'gift purchase status must stay SUCCEEDED',
    );
    await prisma.user.delete({ where: { id: admin.id } });

    console.log(
      'PASS: cards stay separate; nearest-expiry spend; refund → card balances; gift purchase non-refundable',
    );
  } finally {
    await cleanup(userId, createdCardIds);
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error('FAIL:', error);
  await prisma.$disconnect();
  process.exit(1);
});
