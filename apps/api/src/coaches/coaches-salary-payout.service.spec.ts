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
            salaryPerClassAmd: 8000,
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
            salaryPerClassAmd: 8000,
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
});
