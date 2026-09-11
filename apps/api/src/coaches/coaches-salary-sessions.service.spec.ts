import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { CoachSalarySessionsService } from './coaches-salary-sessions.service';

describe('CoachSalarySessionsService', () => {
  function buildService(
    sessions: unknown[],
    total: number,
    rates: { classTypeId: string; amountAmd: number }[],
  ) {
    const findMany = jest.fn().mockResolvedValue(sessions);
    const count = jest.fn().mockResolvedValue(total);
    const rateFindMany = jest.fn().mockResolvedValue(rates);
    const service = new CoachSalarySessionsService({
      classSession: { findMany, count },
      coachClassTypeRate: { findMany: rateFindMany },
    } as never);
    return { service, findMany, count, rateFindMany };
  }

  it('applies the coach×classType rate to sessions with no accrual yet', async () => {
    const { service } = buildService(
      [
        {
          id: 'session-1',
          startsAt: new Date('2026-08-10T10:00:00.000Z'),
          endsAt: new Date('2026-08-10T11:00:00.000Z'),
          status: ClassSessionStatus.FINISHED,
          capacity: 8,
          classTypeId: 'class-type-1',
          classType: { id: 'class-type-1', name: 'Pilates' },
          salaryAccrual: null,
          bookings: [{ status: BookingStatus.MISSED }],
        },
      ],
      1,
      [{ classTypeId: 'class-type-1', amountAmd: 8000 }],
    );

    const page = await service.listForCoach('coach-1', { month: '2026-08' });

    expect(page.total).toBe(1);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      rateAmd: 8000,
      amountAmd: 0,
      reason: 'NO_SHOW_ONLY',
      noShowCount: 1,
      attendedCount: 0,
    });
  });

  it('resolves the coach profile from the user id for the panel endpoint', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const findUniqueProfile = jest.fn().mockResolvedValue({ id: 'coach-1' });
    const service = new CoachSalarySessionsService({
      coachProfile: { findUnique: findUniqueProfile },
      classSession: { findMany, count },
      coachClassTypeRate: { findMany: jest.fn().mockResolvedValue([]) },
    } as never);

    const page = await service.listForUser('user-1', {});

    expect(findUniqueProfile).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { id: true },
    });
    expect(page).toEqual({ items: [], total: 0, take: 25, offset: 0 });
  });

  it('returns null when the user has no coach profile', async () => {
    const service = new CoachSalarySessionsService({
      coachProfile: { findUnique: jest.fn().mockResolvedValue(null) },
    } as never);

    await expect(service.listForUser('user-2', {})).resolves.toBeNull();
  });

  it('falls back to a zero rate when no coach×classType rate exists', async () => {
    const { service } = buildService(
      [
        {
          id: 'session-2',
          startsAt: new Date('2026-08-11T10:00:00.000Z'),
          endsAt: new Date('2026-08-11T11:00:00.000Z'),
          status: ClassSessionStatus.FINISHED,
          capacity: 10,
          classTypeId: 'class-type-2',
          classType: { id: 'class-type-2', name: 'Yoga' },
          salaryAccrual: null,
          bookings: [{ status: BookingStatus.COMPLETED }],
        },
      ],
      1,
      [],
    );

    const page = await service.listForCoach('coach-1', {});

    expect(page.items[0]).toMatchObject({
      rateAmd: 0,
      reason: 'NO_RATE_CONFIGURED',
    });
  });
});
