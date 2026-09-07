import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CoachSalaryPayoutService } from './coaches-salary-payout.service';

const admin = {
  id: 'admin-1',
  role: Role.ADMIN,
} as never;

describe('CoachSalaryPayoutService', () => {
  it('creates a payout history row when none exists for the month', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'payout-1' });
    const findMany = jest.fn().mockResolvedValue([]);
    const log = jest.fn().mockResolvedValue(undefined);
    const forProfile = jest
      .fn()
      .mockResolvedValueOnce({
        coachProfileId: 'coach-1',
        pendingPayoutCents: 150_000,
        salaryPerClassAmd: 8000,
      })
      .mockResolvedValueOnce({
        coachProfileId: 'coach-1',
        pendingPayoutCents: 0,
        paidOutCents: 150_000,
        salaryPerClassAmd: 8000,
      });
    const service = new CoachSalaryPayoutService(
      {
        coachProfile: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'coach-1',
          }),
        },
        coachSalaryPayout: { create, findMany },
        $transaction: jest.fn(),
      } as never,
      { log } as never,
      { forProfile } as never,
    );

    const result = await service.markMonthPaid(admin, 'coach-1', '2026-08');

    expect(create).toHaveBeenCalledWith({
      data: {
        coachProfileId: 'coach-1',
        amountAmd: 150_000,
        periodYear: 2026,
        periodMonth: 8,
        paidByAdminId: 'admin-1',
      },
    });
    expect(result.pendingPayoutCents).toBe(0);
    expect(log).toHaveBeenCalled();
  });

  it('adds unpaid salary onto the existing month payout row', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'payout-1' });
    const findMany = jest.fn().mockResolvedValue([
      { id: 'payout-1', amountAmd: 80_000 },
      { id: 'payout-2', amountAmd: 10_000 },
    ]);
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const transaction = jest.fn(async (ops: unknown) => ops);
    const forProfile = jest
      .fn()
      .mockResolvedValueOnce({
        coachProfileId: 'coach-1',
        pendingPayoutCents: 5_000,
      })
      .mockResolvedValueOnce({
        coachProfileId: 'coach-1',
        pendingPayoutCents: 0,
        paidOutCents: 95_000,
      });
    const service = new CoachSalaryPayoutService(
      {
        coachProfile: {
          findUnique: jest.fn().mockResolvedValue({ id: 'coach-1' }),
        },
        coachSalaryPayout: { findMany, update, deleteMany },
        $transaction: transaction,
      } as never,
      { log: jest.fn() } as never,
      { forProfile } as never,
    );

    await service.markMonthPaid(admin, 'coach-1', '2026-09');

    expect(transaction).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: 'payout-1' },
      data: {
        amountAmd: 95_000,
        paidAt: expect.any(Date),
        paidByAdminId: 'admin-1',
      },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['payout-2'] } },
    });
  });

  it('rejects paying a month with no unpaid salary', async () => {
    const service = new CoachSalaryPayoutService(
      {
        coachProfile: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'coach-1',
          }),
        },
        coachSalaryPayout: { create: jest.fn(), findMany: jest.fn() },
      } as never,
      { log: jest.fn() } as never,
      {
        forProfile: jest.fn().mockResolvedValue({ pendingPayoutCents: 0 }),
      } as never,
    );

    await expect(
      service.markMonthPaid(admin, 'coach-1', '2026-08'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unknown coach', async () => {
    const service = new CoachSalaryPayoutService(
      {
        coachProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      } as never,
      { log: jest.fn() } as never,
      { forProfile: jest.fn() } as never,
    );

    await expect(
      service.markMonthPaid(admin, 'missing', '2026-08'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists paid salary history aggregated by coach and month', async () => {
    const groupBy = jest.fn().mockResolvedValue([
      {
        coachProfileId: 'coach-1',
        periodYear: 2026,
        periodMonth: 9,
        _sum: { amountAmd: 90_000 },
        _max: { paidAt: new Date('2026-09-07T10:00:00.000Z') },
      },
    ]);
    const aggregate = jest.fn().mockResolvedValue({ _sum: { amountAmd: 90_000 } });
    const findManyProfiles = jest.fn().mockResolvedValue([
      {
        id: 'coach-1',
        userId: 'user-1',
        user: {
          name: 'Taguhi',
          lastName: 'Sukiasyan',
          phone: '+37400000000',
          email: 'taguhi@example.com',
        },
      },
    ]);
    const findFirst = jest.fn().mockResolvedValue({ id: 'payout-latest' });
    const service = new CoachSalaryPayoutService(
      {
        coachSalaryPayout: { groupBy, aggregate, findFirst },
        coachProfile: { findMany: findManyProfiles },
      } as never,
      { log: jest.fn() } as never,
      { forProfile: jest.fn() } as never,
    );

    const result = await service.listAdmin({ month: '2026-09', take: 25, offset: 0 });

    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['coachProfileId', 'periodYear', 'periodMonth'],
        where: { periodYear: 2026, periodMonth: 9 },
      }),
    );
    expect(result.total).toBe(1);
    expect(result.totalPaidCents).toBe(90_000);
    expect(result.items[0]?.amountAmd).toBe(90_000);
    expect(result.items[0]?.coach.name).toBe('Taguhi');
  });
});
