import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingStatus, UserPackageStatus } from '@prisma/client';
import { BookingsStaffCancelService } from './bookings-staff-cancel.service';
import { STAFF_CANCEL_PACKAGE_EXPIRED_MESSAGE } from './bookings-staff-cancel.helpers';

const ACTOR = { id: 'manager-1' };
const BOOKING_ID = 'booking-1';

function sessionShape(endsAt = new Date('2026-08-20T19:00:00.000Z')) {
  return {
    id: 'session-1',
    priceCents: 0,
    sessionRequirement: null,
    status: 'FINISHED',
    endsAt,
  };
}

describe('BookingsStaffCancelService', () => {
  function buildService(booking: Record<string, unknown> | null) {
    const prisma = {
      booking: { findUnique: jest.fn().mockResolvedValue(booking) },
    };
    const slots = { releaseSlot: jest.fn().mockResolvedValue(undefined) };
    const schedule = { invalidatePublicCache: jest.fn().mockResolvedValue(undefined) };
    const realtime = { emitBookingSessionChange: jest.fn() };
    const service = new BookingsStaffCancelService(
      prisma as never,
      slots as never,
      schedule as never,
      realtime as never,
    );
    return { service, prisma, slots, schedule, realtime };
  }

  it('cancels a completed visit without penalty and records the staff actor', async () => {
    const booking = {
      id: BOOKING_ID,
      userId: 'user-1',
      sessionId: 'session-1',
      status: BookingStatus.COMPLETED,
      session: sessionShape(),
      consumptions: [
        {
          userPackage: {
            currentPeriodEnd: new Date('2026-09-20T00:00:00.000Z'),
            status: UserPackageStatus.ACTIVE,
          },
        },
      ],
    };
    const { service, slots, realtime } = buildService(booking);

    await expect(service.adminCancel(ACTOR, BOOKING_ID)).resolves.toEqual({
      ok: true,
    });
    expect(slots.releaseSlot).toHaveBeenCalledWith(booking, {
      applyPenalty: false,
      cancelledByUserId: ACTOR.id,
      reopenCapacity: false,
    });
    expect(realtime.emitBookingSessionChange).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: 'session-1',
    });
  });

  it('rejects cancel after the consumed package has expired', async () => {
    const { service, slots } = buildService({
      id: BOOKING_ID,
      userId: 'user-1',
      sessionId: 'session-1',
      status: BookingStatus.COMPLETED,
      session: sessionShape(),
      consumptions: [
        {
          userPackage: {
            currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
            status: UserPackageStatus.ACTIVE,
          },
        },
      ],
    });

    await expect(service.adminCancel(ACTOR, BOOKING_ID)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.adminCancel(ACTOR, BOOKING_ID)).rejects.toThrow(
      STAFF_CANCEL_PACKAGE_EXPIRED_MESSAGE,
    );
    expect(slots.releaseSlot).not.toHaveBeenCalled();
  });

  it('still cancels upcoming booked rows when the package period already ended', async () => {
    const booking = {
      id: BOOKING_ID,
      userId: 'user-1',
      sessionId: 'session-1',
      status: BookingStatus.BOOKED,
      cancelledAt: null,
      session: sessionShape(new Date('2099-01-01T19:00:00.000Z')),
      consumptions: [
        {
          userPackage: {
            currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
            status: UserPackageStatus.EXPIRED,
          },
        },
      ],
    };
    const { service, slots } = buildService(booking);

    await expect(service.adminCancel(ACTOR, BOOKING_ID)).resolves.toEqual({
      ok: true,
    });
    expect(slots.releaseSlot).toHaveBeenCalledWith(booking, {
      applyPenalty: false,
      cancelledByUserId: ACTOR.id,
      reopenCapacity: true,
    });
  });

  it('rejects already cancelled bookings', async () => {
    const { service, slots } = buildService({
      id: BOOKING_ID,
      userId: 'user-1',
      sessionId: 'session-1',
      status: BookingStatus.CANCELLED,
      session: sessionShape(),
      consumptions: [],
    });

    await expect(service.adminCancel(ACTOR, BOOKING_ID)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(slots.releaseSlot).not.toHaveBeenCalled();
  });

  it('throws not found when the booking is missing', async () => {
    const { service } = buildService(null);
    await expect(service.adminCancel(ACTOR, BOOKING_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
