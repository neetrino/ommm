import { BookingStatus } from '@prisma/client';
import { BookingsSlotService } from './bookings-slot.service';

type ReleaseSlotBooking = {
  id: string;
  userId: string;
  sessionId: string;
  session: { priceCents: number; sessionRequirement: number | null };
};

function createSlotServiceAndDeps() {
  const tx = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn(
      async (callback: (value: typeof tx) => Promise<void>) => callback(tx),
    ),
    classSession: {
      updateMany: jest.fn(),
    },
  };

  const waitlist = { offerNextIfSlot: jest.fn() };
  const packageUsage = { restoreSession: jest.fn() };

  const service = new BookingsSlotService(
    prisma as never,
    waitlist as never,
    packageUsage as never,
  );

  return { service, tx, prisma, waitlist, packageUsage };
}

describe('BookingsSlotService package credit release', () => {
  const booking: ReleaseSlotBooking = {
    id: 'booking-1',
    userId: 'user-1',
    sessionId: 'session-1',
    session: { priceCents: 12000, sessionRequirement: null },
  };

  it('restores package credits when cancellation is not penalized', async () => {
    const { service, tx, packageUsage } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(booking, { applyPenalty: false });

    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: booking.id,
    });
  });

  it('restores package credits for free package-backed cancellations', async () => {
    const { service, tx, packageUsage } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(
      {
        ...booking,
        session: { priceCents: 0, sessionRequirement: null },
      },
      { applyPenalty: false },
    );

    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: booking.id,
    });
  });

  it('does not restore package credits when cancellation is penalized', async () => {
    const { service, tx, packageUsage } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(booking, { applyPenalty: true });

    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });

  it('does not restore package credits for paid drop-in cancellations', async () => {
    const { service, tx, packageUsage } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue({ id: 'payment-1' });

    await service.releaseSlot(booking, { applyPenalty: false });

    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });
});

describe('BookingsSlotService.releaseRegistrationsForAdminCancelledSession', () => {
  it('cancels booked rows without penalty and restores already cancelled rows', async () => {
    const { service, packageUsage, prisma, tx } = createSlotServiceAndDeps();
    const booked = {
      id: 'booking-booked',
      userId: 'user-booked',
      sessionId: 'session-1',
      status: BookingStatus.BOOKED,
      session: { priceCents: 0, sessionRequirement: null },
    };
    const cancelled = {
      id: 'booking-cancelled',
      userId: 'user-cancelled',
      sessionId: 'session-1',
      status: BookingStatus.CANCELLED,
      session: { priceCents: 0, sessionRequirement: null },
    };
    prisma.booking = {
      findMany: jest.fn().mockResolvedValue([booked, cancelled]),
    };
    const releaseSlot = jest
      .spyOn(service, 'releaseSlot')
      .mockResolvedValue(undefined);

    const userIds =
      await service.releaseRegistrationsForAdminCancelledSession('session-1');

    expect(releaseSlot).toHaveBeenCalledWith(booked, { applyPenalty: false });
    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: cancelled.id,
    });
    expect(userIds).toEqual(['user-booked', 'user-cancelled']);
  });

  it('skips completed and missed bookings', async () => {
    const { service, packageUsage, prisma } = createSlotServiceAndDeps();
    prisma.booking = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'booking-done',
          userId: 'user-done',
          sessionId: 'session-1',
          status: BookingStatus.COMPLETED,
          session: { priceCents: 0, sessionRequirement: null },
        },
        {
          id: 'booking-missed',
          userId: 'user-missed',
          sessionId: 'session-1',
          status: BookingStatus.MISSED,
          session: { priceCents: 0, sessionRequirement: null },
        },
      ]),
    };
    const releaseSlot = jest
      .spyOn(service, 'releaseSlot')
      .mockResolvedValue(undefined);

    const userIds =
      await service.releaseRegistrationsForAdminCancelledSession('session-1');

    expect(releaseSlot).not.toHaveBeenCalled();
    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
    expect(userIds).toEqual([]);
  });
});
