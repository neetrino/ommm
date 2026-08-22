import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { CoachSalaryAccrualService } from './coaches-salary-accrual.service';

describe('CoachSalaryAccrualService', () => {
  const sessionId = 'session-1';

  function buildService(session: Record<string, unknown> | null) {
    const create = jest.fn().mockResolvedValue({ id: 'accrual-1' });
    const service = new CoachSalaryAccrualService({
      classSession: { findUnique: jest.fn().mockResolvedValue(session) },
      coachSalaryAccrual: { create },
    } as never);
    return { service, create };
  }

  it('creates an accrual for a finished class with participants', async () => {
    const { service, create } = buildService({
      id: sessionId,
      status: ClassSessionStatus.FINISHED,
      startsAt: new Date('2026-08-10T10:00:00.000Z'),
      coachId: 'coach-1',
      coach: { salaryPerClassAmd: 8000 },
      salaryAccrual: null,
      _count: { bookings: 2 },
    });

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(true);
    expect(create).toHaveBeenCalledWith({
      data: {
        coachProfileId: 'coach-1',
        classSessionId: sessionId,
        amountAmd: 8000,
        periodYear: 2026,
        periodMonth: 8,
      },
    });
  });

  it('skips finished classes with zero registered participants', async () => {
    const { service, create } = buildService({
      id: sessionId,
      status: ClassSessionStatus.FINISHED,
      startsAt: new Date('2026-08-10T10:00:00.000Z'),
      coachId: 'coach-1',
      coach: { salaryPerClassAmd: 8000 },
      salaryAccrual: null,
      _count: { bookings: 0 },
    });

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('skips when an accrual already exists', async () => {
    const { service, create } = buildService({
      id: sessionId,
      status: ClassSessionStatus.FINISHED,
      startsAt: new Date('2026-08-10T10:00:00.000Z'),
      coachId: 'coach-1',
      coach: { salaryPerClassAmd: 8000 },
      salaryAccrual: { id: 'existing' },
      _count: { bookings: 1 },
    });

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('skips cancelled classes even when they have participants', async () => {
    const { service, create } = buildService({
      id: sessionId,
      status: ClassSessionStatus.CANCELLED,
      startsAt: new Date('2026-08-10T10:00:00.000Z'),
      coachId: 'coach-1',
      coach: { salaryPerClassAmd: 8000 },
      salaryAccrual: null,
      _count: { bookings: 5 },
    });

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('uses the coach salaryPerClassAmd snapshot, not a shared default rate', async () => {
    const { service, create } = buildService({
      id: sessionId,
      status: ClassSessionStatus.FINISHED,
      startsAt: new Date('2026-08-10T10:00:00.000Z'),
      coachId: 'coach-b',
      coach: { salaryPerClassAmd: 10_000 },
      salaryAccrual: null,
      _count: { bookings: 1 },
    });

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
    const [[createCall]] = create.mock.calls as [
      [{ data: { coachProfileId: string; amountAmd: number } }],
    ];
    expect(createCall.data).toMatchObject({
      coachProfileId: 'coach-b',
      amountAmd: 10_000,
    });
  });

  it('counts non-cancelled bookings in the lookup filter', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const service = new CoachSalaryAccrualService({
      classSession: { findUnique },
    } as never);

    await service.accrueFinishedSession(sessionId);

    expect(findUnique).toHaveBeenCalledTimes(1);
    const [[findUniqueCall]] = findUnique.mock.calls as [
      [
        {
          select: {
            _count: {
              select: {
                bookings: { where: { status: { not: BookingStatus } } };
              };
            };
          };
        },
      ],
    ];
    expect(findUniqueCall.select._count.select.bookings.where).toEqual({
      status: { not: BookingStatus.CANCELLED },
    });
  });
});
