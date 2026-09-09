import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { BookingsStatusTransitionService } from './bookings-status-transition.service';

describe('BookingsStatusTransitionService', () => {
  const now = new Date('2026-07-07T18:00:00.000Z');
  const salaryAccrual = {
    accrueFinishedSessions: jest.fn().mockResolvedValue(0),
    accrueMissingFinishedSessions: jest.fn().mockResolvedValue(0),
    accrueFinishedSession: jest.fn().mockResolvedValue(false),
  };

  const packagesActivation = {
    reconcileAwaitingPackages: jest.fn().mockResolvedValue(0),
  };

  function buildService(prisma: object) {
    return new BookingsStatusTransitionService(
      prisma as never,
      salaryAccrual as never,
      packagesActivation as never,
    );
  }

  beforeEach(() => {
    salaryAccrual.accrueFinishedSessions.mockReset().mockResolvedValue(0);
    packagesActivation.reconcileAwaitingPackages.mockClear();
  });

  it('updates only BOOKED rows whose session has ended', async () => {
    const prisma = {
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
      classSession: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = buildService(prisma);

    const count = await service.completePastBookedSessions(now);

    expect(count).toBe(3);
    expect(packagesActivation.reconcileAwaitingPackages).toHaveBeenCalledWith(
      now,
    );
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
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = buildService(prisma);

    await expect(service.completePastBookedSessions(now)).resolves.toBe(0);
  });

  it('marks ended ACTIVE and FULL class sessions as FINISHED and accrues salary', async () => {
    const prisma = {
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      classSession: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'session-1' }, { id: 'session-2' }]),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const service = buildService(prisma);

    await expect(service.finishPastClassSessions(now)).resolves.toBe(2);
    expect(prisma.classSession.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['session-1', 'session-2'] } },
      data: { status: ClassSessionStatus.FINISHED },
    });
    expect(salaryAccrual.accrueFinishedSessions).toHaveBeenCalledWith([
      'session-1',
      'session-2',
    ]);
  });

  it('settles attendance before accruing so an attended class is not read as a no-show', async () => {
    const callOrder: string[] = [];
    const prisma = {
      booking: {
        updateMany: jest.fn().mockImplementation(() => {
          callOrder.push('completeBookings');
          return { count: 1 };
        }),
      },
      classSession: {
        findMany: jest.fn().mockResolvedValue([{ id: 'session-1' }]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    salaryAccrual.accrueFinishedSessions.mockImplementation(() => {
      callOrder.push('accrue');
      return 1;
    });
    const service = buildService(prisma);

    await service.finishPastClassSessions(now);

    expect(callOrder).toEqual(['completeBookings', 'accrue']);
  });
});
