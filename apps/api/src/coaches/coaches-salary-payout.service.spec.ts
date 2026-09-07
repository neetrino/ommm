import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CoachSalaryPayoutService } from './coaches-salary-payout.service';

const admin = {
  id: 'admin-1',
  role: Role.ADMIN,
} as never;

describe('CoachSalaryPayoutService', () => {
  it('writes a payout history row and returns zero unpaid', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'payout-1' });
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
        coachSalaryPayout: { create },
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

  it('rejects paying a month with no unpaid salary', async () => {
    const service = new CoachSalaryPayoutService(
      {
        coachProfile: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'coach-1',
          }),
        },
        coachSalaryPayout: { create: jest.fn() },
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

  it('lists paid salary history with month filter and totals', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'payout-1',
        coachProfileId: 'coach-1',
        amountAmd: 120_000,
        periodYear: 2026,
        periodMonth: 8,
        paidAt: new Date('2026-09-01T10:00:00.000Z'),
        coachProfile: {
          userId: 'user-1',
          user: {
            name: 'Taguhi',
            lastName: 'Sukiasyan',
            phone: '+37400000000',
            email: 'taguhi@example.com',
          },
        },
      },
    ]);
    const count = jest.fn().mockResolvedValue(1);
    const aggregate = jest.fn().mockResolvedValue({ _sum: { amountAmd: 120_000 } });
    const service = new CoachSalaryPayoutService(
      {
        coachSalaryPayout: { findMany, count, aggregate },
      } as never,
      { log: jest.fn() } as never,
      { forProfile: jest.fn() } as never,
    );

    const result = await service.listAdmin({ month: '2026-08', take: 25, offset: 0 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { periodYear: 2026, periodMonth: 8 },
        take: 25,
        skip: 0,
      }),
    );
    expect(result.total).toBe(1);
    expect(result.totalPaidCents).toBe(120_000);
    expect(result.items[0]?.coach.name).toBe('Taguhi');
  });
});
