import { BookingsClientService } from './bookings-client.service';
import { PackageUsageEligibilityService } from '../packages/package-usage-eligibility.service';
import { PackageUsageLedgerService } from '../packages/package-usage-ledger.service';

type SessionDecrement = { sessionsRemaining: { decrement: number } };
type ConsumptionData = {
  bookingId: string;
  userPackageId: string;
  userPackageBalanceId: string;
  consumedSessions: number;
};

function createHarness(remaining = 1) {
  const balance = {
    id: 'balance-1',
    classTypeId: 'type-1',
    sourceCategoryNameSnapshot: 'Reformer Group',
    sessionsTotal: 1,
    sessionsUsed: 1 - remaining,
    sessionsRemaining: remaining,
    isUnlimited: false,
  };
  const membership = {
    id: 'package-1',
    sessionsRemaining: remaining,
    balances: [balance],
  };
  const tx = {
    booking: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: { sessionId: string } }) =>
          Promise.resolve({
            ...data,
            id: `booking-${data.sessionId}`,
          }),
        ),
    },
    userPackage: {
      findMany: jest
        .fn()
        .mockImplementation(({ where }: { where: { status: string } }) =>
          Promise.resolve(where.status === 'PAUSED' ? [] : [membership]),
        ),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: SessionDecrement }) => {
          membership.sessionsRemaining -= data.sessionsRemaining.decrement;
          return Promise.resolve(membership);
        }),
    },
    userPackageBalance: {
      update: jest
        .fn()
        .mockImplementation(
          ({
            data,
          }: {
            data: SessionDecrement & { sessionsUsed: { increment: number } };
          }) => {
            balance.sessionsRemaining -= data.sessionsRemaining.decrement;
            balance.sessionsUsed += data.sessionsUsed.increment;
            return Promise.resolve(balance);
          },
        ),
    },
    bookingConsumption: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: ConsumptionData }) =>
          Promise.resolve(data),
        ),
    },
  };
  const prisma = {
    booking: { findUnique: jest.fn().mockResolvedValue(null) },
    giftCard: { findMany: jest.fn().mockResolvedValue([]) },
    classSession: {
      findUnique: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: string } }) =>
          Promise.resolve({
            id: where.id,
            status: 'SCHEDULED',
            startsAt: new Date('2099-10-27T15:00:00Z'),
            capacity: 10,
            priceCents: 0,
            sessionRequirement: null,
            classType: { id: 'type-1', name: 'Reformer Group' },
          }),
        ),
    },
    $transaction: jest.fn((callback: (value: typeof tx) => Promise<unknown>) =>
      callback(tx),
    ),
  };
  const eligibility = new PackageUsageEligibilityService(prisma as never);
  const ledger = new PackageUsageLedgerService();
  const service = new BookingsClientService(
    prisma as never,
    { bookedCount: jest.fn().mockResolvedValue(0) } as never,
    {} as never,
    { invalidatePublicCache: jest.fn() } as never,
    { emitBookingSessionChange: jest.fn() } as never,
    {
      getValidatedUserPackageForBooking:
        eligibility.getValidatedUserPackageForBooking.bind(eligibility),
      consumeSession: ledger.consumeSession.bind(ledger),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    { recordBookingCreated: jest.fn() } as never,
    { tryNotify: jest.fn() } as never,
  );
  return { service, tx, membership, balance };
}

describe('BookingsClientService package credit regression', () => {
  it('consumes the only paid class without a package id, then rejects a second booking', async () => {
    const { service, tx, membership, balance } = createHarness();

    await service.book('user-1', 'october-27', undefined, 'user-1');

    expect(membership.sessionsRemaining).toBe(0);
    expect(balance.sessionsRemaining).toBe(0);
    expect(tx.bookingConsumption.create).toHaveBeenCalledWith({
      data: {
        bookingId: 'booking-october-27',
        userPackageId: 'package-1',
        userPackageBalanceId: 'balance-1',
        consumedSessions: 1,
      },
    });

    await expect(
      service.book('user-1', 'october-29', {}, 'user-1'),
    ).rejects.toThrow('No eligible package found for this session');
    expect(tx.booking.create).toHaveBeenCalledTimes(1);
  });

  it('rejects an explicitly selected package with no credit before creating a booking', async () => {
    const { service, tx } = createHarness(0);

    await expect(
      service.book(
        'user-1',
        'session-1',
        { userPackageId: 'package-1' },
        'user-1',
      ),
    ).rejects.toThrow('Selected package is not eligible for booking');
    expect(tx.booking.create).not.toHaveBeenCalled();
    expect(tx.bookingConsumption.create).not.toHaveBeenCalled();
  });
});
