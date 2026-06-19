import { BookingStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';

type ReleaseSlotBooking = {
  id: string;
  userId: string;
  sessionId: string;
  session: { priceCents: number; sessionRequirement: number | null };
};

function createServiceAndDeps() {
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
  const cancelIntent = { clear: jest.fn() };
  const schedule = { invalidatePublicCache: jest.fn() };
  const realtime = {
    emitBookingSessionChange: jest.fn(),
    emitCancelIntentChanged: jest.fn(),
  };
  const packageUsage = { restoreSession: jest.fn() };
  const packages = { listPlans: jest.fn() };

  const service = new BookingsService(
    prisma as never,
    waitlist as never,
    cancelIntent as never,
    schedule as never,
    realtime as never,
    packageUsage as never,
    packages as never,
  );

  return { service, tx, prisma, waitlist, packageUsage };
}

describe('BookingsService package credit release', () => {
  const booking: ReleaseSlotBooking = {
    id: 'booking-1',
    userId: 'user-1',
    sessionId: 'session-1',
    session: { priceCents: 12000, sessionRequirement: null },
  };

  const invokeReleaseSlot = async (
    service: BookingsService,
    target: ReleaseSlotBooking,
    options: { applyPenalty: boolean },
  ): Promise<void> => {
    await (
      service as unknown as {
        releaseSlot(
          booking: ReleaseSlotBooking,
          opts: { applyPenalty: boolean },
        ): Promise<void>;
      }
    ).releaseSlot(target, options);
  };

  it('restores package credits when cancellation is not penalized', async () => {
    const { service, tx, packageUsage } = createServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);

    await invokeReleaseSlot(service, booking, { applyPenalty: false });

    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: booking.id,
    });
  });

  it('does not restore package credits when cancellation is penalized', async () => {
    const { service, tx, packageUsage } = createServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue(null);

    await invokeReleaseSlot(service, booking, { applyPenalty: true });

    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });

  it('does not restore package credits for paid drop-in cancellations', async () => {
    const { service, tx, packageUsage } = createServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({ status: BookingStatus.BOOKED });
    tx.payment.findFirst.mockResolvedValue({ id: 'payment-1' });

    await invokeReleaseSlot(service, booking, { applyPenalty: false });

    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });
});
