import { BadRequestException } from '@nestjs/common';
import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { COACH_SALARY_EXPORT_TOO_MANY_ROWS } from './coaches-salary-export.constants';
import { CoachSalarySessionsService } from './coaches-salary-sessions.service';

const RANGE = { from: '2026-09-01', to: '2026-09-26' };

describe('CoachSalarySessionsService listForExport', () => {
  it('returns every session in the range under the coach name', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      user: { name: 'Armine', lastName: 'Avoyan' },
    });
    const count = jest.fn().mockResolvedValue(1);
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'session-1',
        startsAt: new Date('2026-09-04T08:00:00.000Z'),
        endsAt: new Date('2026-09-04T09:00:00.000Z'),
        status: ClassSessionStatus.FINISHED,
        capacity: 6,
        classTypeId: 'class-1',
        classType: { id: 'class-1', name: 'Reformer Group' },
        salaryAccrual: { amountAmd: 20000 },
        bookings: [{ status: BookingStatus.COMPLETED }],
      },
    ]);
    const service = new CoachSalarySessionsService({
      coachProfile: { findUnique },
      classSession: { findMany, count },
      coachClassTypeRate: { findMany: jest.fn().mockResolvedValue([]) },
    } as never);

    const sheet = await service.listForExport('coach-1', RANGE);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1, skip: 0 }),
    );
    expect(sheet).toMatchObject({
      coachName: 'Armine Avoyan',
      from: RANGE.from,
      to: RANGE.to,
    });
    expect(sheet?.items[0]).toMatchObject({ reason: 'PAID', amountAmd: 20000 });
  });

  it('returns null when the coach does not exist', async () => {
    const service = new CoachSalarySessionsService({
      coachProfile: { findUnique: jest.fn().mockResolvedValue(null) },
    } as never);

    await expect(service.listForExport('missing', RANGE)).resolves.toBeNull();
  });

  it('refuses a range with too many sessions', async () => {
    const findMany = jest.fn();
    const service = new CoachSalarySessionsService({
      coachProfile: {
        findUnique: jest.fn().mockResolvedValue({
          user: { name: 'Armine', lastName: 'Avoyan' },
        }),
      },
      classSession: { findMany, count: jest.fn().mockResolvedValue(5001) },
    } as never);

    await expect(service.listForExport('coach-1', RANGE)).rejects.toThrow(
      COACH_SALARY_EXPORT_TOO_MANY_ROWS,
    );
    await expect(
      service.listForExport('coach-1', RANGE),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findMany).not.toHaveBeenCalled();
  });
});
