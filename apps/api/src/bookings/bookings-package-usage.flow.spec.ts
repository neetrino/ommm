import { BookingStatus } from '@prisma/client';
import { BookingsSlotService } from './bookings-slot.service';
import { isPenalizedCancellation } from './cancellation-policy';
import {
  resolveBookingSessionCredits,
  shouldValidatePackageForBooking,
} from './resolve-booking-session-credits';
import { PackageUsageLedgerService } from '../packages/package-usage-ledger.service';

type MockTx = {
  booking: { findUnique: jest.Mock; update: jest.Mock };
  payment: { findFirst: jest.Mock };
  userPackageBalance: { update: jest.Mock };
  userPackage: { update: jest.Mock };
  bookingConsumption: {
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
};

function createMembership(remaining = 5) {
  const now = new Date();
  return {
    id: 'user-package-1',
    userId: 'user-1',
    planId: 'plan-1',
    sourcePlanIdSnapshot: 'plan-1',
    planNameSnapshot: 'Pack',
    planCategoryNameSnapshot: 'Mat Pilates',
    planPriceCentsSnapshot: 1200,
    planPeriodDaysSnapshot: 30,
    planIsUnlimitedSnapshot: false,
    planSessionsPerMonthSnapshot: 10,
    freezeAllowedCountSnapshot: 0,
    freezeMaxDaysPerUseSnapshot: 0,
    freezesUsedCount: 0,
    status: 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + 86_400_000 * 30),
    sessionsTotal: 10,
    sessionsRemaining: remaining,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    pausedUntil: null,
    pausedAt: null,
    plan: {
      id: 'plan-1',
      name: 'Pack',
      categoryName: 'Mat Pilates',
      isUnlimited: false,
    },
    balances: [
      {
        id: 'balance-1',
        classTypeId: null,
        sourceCategoryNameSnapshot: 'Mat Pilates',
        sessionsTotal: 10,
        sessionsUsed: 10 - remaining,
        sessionsRemaining: remaining,
        isUnlimited: false,
      },
    ],
  };
}

function createSlotHarness() {
  const tx: MockTx = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: { findFirst: jest.fn() },
    userPackageBalance: { update: jest.fn() },
    userPackage: { update: jest.fn() },
    bookingConsumption: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn(async (cb: (value: MockTx) => Promise<void>) =>
      cb(tx),
    ),
    classSession: { updateMany: jest.fn() },
  };
  const ledger = new PackageUsageLedgerService();
  const packageUsage = {
    restoreSession: jest.fn((params) => ledger.restoreSession(params as never)),
    consumeSession: jest.fn((params) => ledger.consumeSession(params as never)),
  };
  const service = new BookingsSlotService(
    prisma as never,
    { offerNextIfSlot: jest.fn() } as never,
    packageUsage as never,
    {
      recordBookingCancelled: jest.fn().mockResolvedValue(undefined),
    } as never,
  );
  return { service, tx, packageUsage, ledger };
}

describe('bookings package usage flow', () => {
  const freeSession = {
    priceCents: 0,
    sessionRequirement: null as number | null,
  };

  it('charges one package credit for free sessions booked with a package', () => {
    expect(
      resolveBookingSessionCredits({
        session: freeSession,
        userPackageId: 'pkg-1',
      }),
    ).toBe(1);
    expect(
      shouldValidatePackageForBooking({
        session: freeSession,
        userPackageId: 'pkg-1',
      }),
    ).toBe(true);
  });

  it('does not charge credits for free walk-in bookings without a package', () => {
    expect(
      resolveBookingSessionCredits({
        session: freeSession,
      }),
    ).toBe(0);
    expect(
      shouldValidatePackageForBooking({
        session: freeSession,
      }),
    ).toBe(false);
  });

  it('marks cancellation as penalized within 24 hours of class start', () => {
    const classStart = new Date(Date.UTC(2026, 6, 8, 8, 0, 0, 0));
    const now = new Date(2026, 6, 7, 13, 0, 0, 0);
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(true);
  });

  it('marks cancellation as free more than 24 hours before class start', () => {
    const classStart = new Date(Date.UTC(2026, 6, 10, 12, 0, 0, 0));
    const now = new Date(2026, 6, 7, 13, 0, 0, 0);
    expect(isPenalizedCancellation(classStart, 24, now)).toBe(false);
  });

  it('restores package credit on non-penalized cancellation', async () => {
    const { service, tx } = createSlotHarness();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);
    tx.bookingConsumption.findMany.mockResolvedValue([
      {
        id: 'consumption-1',
        userPackageId: 'user-package-1',
        userPackageBalanceId: 'balance-1',
        consumedSessions: 1,
      },
    ]);

    await service.releaseSlot(
      {
        id: 'booking-1',
        userId: 'user-1',
        sessionId: 'session-1',
        session: freeSession,
      },
      { applyPenalty: false },
    );

    expect(tx.userPackageBalance.update).toHaveBeenCalledWith({
      where: { id: 'balance-1' },
      data: {
        sessionsUsed: { decrement: 1 },
        sessionsRemaining: { increment: 1 },
      },
    });
    expect(tx.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'user-package-1' },
      data: { sessionsRemaining: { increment: 1 } },
    });
  });

  it('keeps package credit spent on penalized cancellation', async () => {
    const { service, tx } = createSlotHarness();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(
      {
        id: 'booking-1',
        userId: 'user-1',
        sessionId: 'session-1',
        session: freeSession,
      },
      { applyPenalty: true },
    );

    expect(tx.bookingConsumption.findMany).not.toHaveBeenCalled();
    expect(tx.userPackageBalance.update).not.toHaveBeenCalled();
    expect(tx.userPackage.update).not.toHaveBeenCalled();
  });

  it('consumes and restores a limited package session through the ledger', async () => {
    const ledger = new PackageUsageLedgerService();
    const tx: MockTx = {
      booking: { findUnique: jest.fn(), update: jest.fn() },
      payment: { findFirst: jest.fn() },
      userPackageBalance: { update: jest.fn() },
      userPackage: { update: jest.fn() },
      bookingConsumption: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'consumption-1',
            userPackageId: 'user-package-1',
            userPackageBalanceId: 'balance-1',
            consumedSessions: 1,
          },
        ]),
        update: jest.fn(),
      },
    };

    await ledger.consumeSession({
      tx: tx as never,
      bookingId: 'booking-1',
      membership: createMembership(5) as never,
      sessionClassType: { id: 'type-mat', name: 'Mat Pilates' },
      requiredSessions: 1,
    });

    expect(tx.userPackageBalance.update).toHaveBeenCalledWith({
      where: { id: 'balance-1' },
      data: {
        sessionsUsed: { increment: 1 },
        sessionsRemaining: { decrement: 1 },
      },
    });

    await ledger.restoreSession({
      tx: tx as never,
      bookingId: 'booking-1',
    });

    expect(tx.userPackageBalance.update).toHaveBeenLastCalledWith({
      where: { id: 'balance-1' },
      data: {
        sessionsUsed: { decrement: 1 },
        sessionsRemaining: { increment: 1 },
      },
    });
  });
});
