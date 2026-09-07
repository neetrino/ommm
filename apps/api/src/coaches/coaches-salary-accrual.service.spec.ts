import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { CoachSalaryAccrualService } from './coaches-salary-accrual.service';

describe('CoachSalaryAccrualService', () => {
  const sessionId = 'session-1';
  const classTypeId = 'class-type-1';

  function buildService(
    session: Record<string, unknown> | null,
    rateAmountAmd: number | null = 8000,
  ) {
    const create = jest.fn().mockResolvedValue({ id: 'accrual-1' });
    const findRate = jest.fn().mockResolvedValue(
      rateAmountAmd === null ? null : { amountAmd: rateAmountAmd },
    );
    const service = new CoachSalaryAccrualService({
      classSession: { findUnique: jest.fn().mockResolvedValue(session) },
      coachClassTypeRate: { findUnique: findRate },
      coachSalaryAccrual: { create },
    } as never);
    return { service, create, findRate };
  }

  function finishedSession(
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      id: sessionId,
      status: ClassSessionStatus.FINISHED,
      startsAt: new Date('2026-08-10T10:00:00.000Z'),
      coachId: 'coach-1',
      classTypeId,
      salaryAccrual: null,
      _count: { bookings: 2 },
      ...overrides,
    };
  }

  it('creates an accrual using the coach×classType rate', async () => {
    const { service, create, findRate } = buildService(finishedSession());

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(true);
    expect(findRate).toHaveBeenCalledWith({
      where: {
        coachProfileId_classTypeId: {
          coachProfileId: 'coach-1',
          classTypeId,
        },
      },
      select: { amountAmd: true },
    });
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
    const { service, create } = buildService(
      finishedSession({ _count: { bookings: 0 } }),
    );

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('skips when an accrual already exists', async () => {
    const { service, create } = buildService(
      finishedSession({ salaryAccrual: { id: 'existing' } }),
    );

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('skips cancelled classes even when they have participants', async () => {
    const { service, create } = buildService(
      finishedSession({
        status: ClassSessionStatus.CANCELLED,
        _count: { bookings: 5 },
      }),
    );

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('uses the coach×classType rate snapshot, not a shared default', async () => {
    const { service, create } = buildService(
      finishedSession({ coachId: 'coach-b', _count: { bookings: 1 } }),
      10_000,
    );

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

  it('skips when no rate is configured for the class type', async () => {
    const { service, create } = buildService(finishedSession(), null);

    await expect(service.accrueFinishedSession(sessionId)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('counts non-cancelled bookings in the lookup filter', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const service = new CoachSalaryAccrualService({
      classSession: { findUnique },
      coachClassTypeRate: { findUnique: jest.fn() },
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
