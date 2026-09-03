import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { BookingsSlotService } from './bookings-slot.service';
import { RELEASE_SLOT_ERROR } from './bookings-slot.helpers';

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
    booking: {
      findMany: jest.fn(),
    },
  };

  const waitlist = { offerNextIfSlot: jest.fn() };
  const packageUsage = { restoreSession: jest.fn() };
  const staffActivity = {
    recordBookingCancelled: jest.fn().mockResolvedValue(undefined),
  };

  const service = new BookingsSlotService(
    prisma as never,
    waitlist as never,
    packageUsage as never,
    staffActivity as never,
  );

  return { service, tx, prisma, waitlist, packageUsage, staffActivity };
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
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.BOOKED,
      cancelledAt: null,
    });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(booking, { applyPenalty: false });

    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: booking.id,
    });
  });

  it('restores package credits for free package-backed cancellations', async () => {
    const { service, tx, packageUsage } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.BOOKED,
      cancelledAt: null,
    });
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
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.BOOKED,
      cancelledAt: null,
    });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(booking, { applyPenalty: true });

    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });

  it('does not restore package credits for paid drop-in cancellations', async () => {
    const { service, tx, packageUsage } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.BOOKED,
      cancelledAt: null,
    });
    tx.payment.findFirst.mockResolvedValue({ id: 'payment-1' });

    await service.releaseSlot(booking, { applyPenalty: false });

    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });

  it('records the staff actor and restores credits without reopening waitlist', async () => {
    const { service, tx, packageUsage, waitlist, prisma } =
      createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.COMPLETED,
      cancelledAt: null,
    });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot(
      {
        ...booking,
        session: {
          ...booking.session,
          status: ClassSessionStatus.FINISHED,
          endsAt: new Date('2026-09-01T10:00:00.000Z'),
        },
      },
      {
        applyPenalty: false,
        cancelledByUserId: 'manager-1',
      },
    );

    const updateCall = tx.booking.update.mock.calls[0] as
      | [
          {
            where: { id: string };
            data: {
              status: BookingStatus;
              cancelledAt: Date;
              cancelledByUserId: string;
            };
          },
        ]
      | undefined;
    expect(updateCall?.[0]).toEqual({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: updateCall?.[0].data.cancelledAt,
        cancelledByUserId: 'manager-1',
      },
    });
    expect(updateCall?.[0].data.cancelledAt).toBeInstanceOf(Date);
    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: booking.id,
    });
    expect(prisma.classSession.updateMany).not.toHaveBeenCalled();
    expect(waitlist.offerNextIfSlot).not.toHaveBeenCalled();
  });

  it('restores package credits when cancelling a missed booking', async () => {
    const { service, tx, packageUsage, waitlist, prisma } =
      createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.MISSED,
      cancelledAt: null,
    });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot({
      ...booking,
      session: {
        ...booking.session,
        status: ClassSessionStatus.FINISHED,
        endsAt: new Date('2026-09-01T10:00:00.000Z'),
      },
    });

    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: booking.id,
    });
    expect(prisma.classSession.updateMany).not.toHaveBeenCalled();
    expect(waitlist.offerNextIfSlot).not.toHaveBeenCalled();
  });

  it('still opens the slot after cancelling an upcoming booked session', async () => {
    const { service, tx, waitlist, prisma } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.BOOKED,
      cancelledAt: null,
    });
    tx.payment.findFirst.mockResolvedValue(null);

    await service.releaseSlot({
      ...booking,
      session: {
        ...booking.session,
        status: ClassSessionStatus.FULL,
        endsAt: new Date('2026-09-10T10:00:00.000Z'),
      },
    });

    expect(prisma.classSession.updateMany).toHaveBeenCalledWith({
      where: { id: booking.sessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    expect(waitlist.offerNextIfSlot).toHaveBeenCalledWith(booking.sessionId);
  });

  it('rejects already cancelled bookings', async () => {
    const { service, tx } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue({
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date('2026-09-01T10:00:00.000Z'),
    });

    await expect(service.releaseSlot(booking)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.releaseSlot(booking)).rejects.toMatchObject({
      message: RELEASE_SLOT_ERROR.NOT_CANCELLABLE,
    });
  });

  it('rejects a missing booking', async () => {
    const { service, tx } = createSlotServiceAndDeps();
    tx.booking.findUnique.mockResolvedValue(null);

    await expect(service.releaseSlot(booking)).rejects.toBeInstanceOf(
      NotFoundException,
    );
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
