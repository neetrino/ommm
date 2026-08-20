import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { BookingsStatusTransitionService } from './bookings-status-transition.service';

describe('BookingsStatusTransitionService', () => {
  const now = new Date('2026-07-07T18:00:00.000Z');

  it('updates only BOOKED rows whose session has ended', async () => {
    const prisma = {
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
      classSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new BookingsStatusTransitionService(prisma as never);

    const count = await service.completePastBookedSessions(now);

    expect(count).toBe(3);
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: {
        status: BookingStatus.BOOKED,
        session: { endsAt: { lte: now } },
      },
      data: {
        status: BookingStatus.COMPLETED,
        attendedAt: now,
      },
    });
  });

  it('returns zero when no rows match', async () => {
    const prisma = {
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      classSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new BookingsStatusTransitionService(prisma as never);

    await expect(service.completePastBookedSessions(now)).resolves.toBe(0);
  });

  it('marks ended ACTIVE and FULL class sessions as FINISHED', async () => {
    const prisma = {
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      classSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const service = new BookingsStatusTransitionService(prisma as never);

    await expect(service.finishPastClassSessions(now)).resolves.toBe(2);
    expect(prisma.classSession.updateMany).toHaveBeenCalledWith({
      where: {
        endsAt: { lte: now },
        status: {
          in: [ClassSessionStatus.ACTIVE, ClassSessionStatus.FULL],
        },
      },
      data: { status: ClassSessionStatus.FINISHED },
    });
  });
});
