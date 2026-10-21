import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { ClassesSessionsAdminService } from './classes-sessions-admin.service';

describe('ClassesSessionsAdminService.deleteSession', () => {
  const schedule = {
    invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
  };
  const realtime = {
    emitPublicScheduleSession: jest.fn(),
  };
  const actor = { id: 'admin-1', role: 'ADMIN' };

  function buildService(found: boolean) {
    const update = jest.fn().mockResolvedValue({});
    const session = found
      ? {
          id: 'session-1',
          status: ClassSessionStatus.ACTIVE,
          endsAt: new Date('2030-01-01T00:00:00.000Z'),
          capacity: 8,
          _count: { bookings: 2 },
        }
      : null;
    const findUnique = jest.fn().mockResolvedValue(session);
    const apply = jest.fn().mockResolvedValue(undefined);
    const prisma = {
      classSession: { findUnique, update, delete: jest.fn() },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      {} as never,
      schedule as never,
      realtime as never,
      { apply } as never,
      {
        finishPastClassSessions: jest.fn().mockResolvedValue(0),
        onSessionFinished: jest.fn(),
      } as never,
      { offerNextIfSlot: jest.fn().mockResolvedValue(undefined) } as never,
    );
    return { service, prisma, apply };
  }

  it('cancels the session instead of deleting it', async () => {
    const { service, prisma, apply } = buildService(true);

    await service.deleteSession('session-1', actor);

    expect(prisma.classSession.delete).not.toHaveBeenCalled();
    expect(prisma.classSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { status: ClassSessionStatus.CANCELLED },
    });
    expect(apply).toHaveBeenCalledWith('session-1');
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('throws NotFoundException when the session does not exist', async () => {
    const { service, prisma } = buildService(false);

    await expect(
      service.deleteSession('missing', actor),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.classSession.delete).not.toHaveBeenCalled();
  });
});

describe('ClassesSessionsAdminService class type archive', () => {
  const schedule = {
    invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
  };
  const realtime = { emitPublicScheduleSession: jest.fn() };
  const cancelCascade = { apply: jest.fn() };

  it('does not create a session when the class type is archived', async () => {
    const create = jest.fn();
    const prisma = { classSession: { create } };
    const typesService = {
      assertClassTypeAssignable: jest
        .fn()
        .mockRejectedValue(
          new BadRequestException(
            'Class type is not available for new sessions.',
          ),
        ),
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      typesService as never,
      schedule as never,
      realtime as never,
      cancelCascade as never,
      {
        finishPastClassSessions: jest.fn().mockResolvedValue(0),
        onSessionFinished: jest.fn(),
      } as never,
      { offerNextIfSlot: jest.fn().mockResolvedValue(undefined) } as never,
    );

    await expect(
      service.createSession({
        classTypeId: 'ct-archived',
        coachId: 'coach-1',
        startsAt: '2026-08-20T10:00:00.000Z',
        endsAt: '2026-08-20T11:00:00.000Z',
        capacity: 8,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('ClassesSessionsAdminService.updateSessionStatus', () => {
  it('cascades member release when status becomes CANCELLED', async () => {
    const cancelCascade = { apply: jest.fn().mockResolvedValue(undefined) };
    const schedule = {
      invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
    };
    const realtime = { emitPublicScheduleSession: jest.fn() };
    const prisma = {
      classSession: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'session-1', status: 'ACTIVE' })
          .mockResolvedValueOnce({
            id: 'session-1',
            status: 'CANCELLED',
            capacity: 6,
            _count: { bookings: 0 },
          }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      {} as never,
      schedule as never,
      realtime as never,
      cancelCascade as never,
      {
        finishPastClassSessions: jest.fn().mockResolvedValue(0),
        onSessionFinished: jest.fn(),
      } as never,
      { offerNextIfSlot: jest.fn().mockResolvedValue(undefined) } as never,
    );

    await service.updateSessionStatus('session-1', 'CANCELLED');
    expect(cancelCascade.apply).toHaveBeenCalledWith('session-1');
  });

  it('does not cascade when activating a session', async () => {
    const cancelCascade = { apply: jest.fn().mockResolvedValue(undefined) };
    const schedule = {
      invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
    };
    const realtime = { emitPublicScheduleSession: jest.fn() };
    const prisma = {
      classSession: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'session-1', status: 'CANCELLED' })
          .mockResolvedValueOnce({
            id: 'session-1',
            status: 'ACTIVE',
            endsAt: new Date('2099-01-01T00:00:00.000Z'),
            capacity: 6,
            _count: { bookings: 0 },
          }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      {} as never,
      schedule as never,
      realtime as never,
      cancelCascade as never,
      {
        finishPastClassSessions: jest.fn().mockResolvedValue(0),
        onSessionFinished: jest.fn(),
      } as never,
      { offerNextIfSlot: jest.fn().mockResolvedValue(undefined) } as never,
    );

    await service.updateSessionStatus('session-1', 'ACTIVE');
    expect(cancelCascade.apply).not.toHaveBeenCalled();
  });

  it('cancelSession uses the same cascade as status CANCELLED', async () => {
    const cancelCascade = { apply: jest.fn().mockResolvedValue(undefined) };
    const schedule = {
      invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
    };
    const realtime = { emitPublicScheduleSession: jest.fn() };
    const prisma = {
      classSession: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'session-1', status: 'ACTIVE' })
          .mockResolvedValueOnce({
            id: 'session-1',
            status: 'CANCELLED',
            capacity: 6,
            _count: { bookings: 0 },
          }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      {} as never,
      schedule as never,
      realtime as never,
      cancelCascade as never,
      {
        finishPastClassSessions: jest.fn().mockResolvedValue(0),
        onSessionFinished: jest.fn(),
      } as never,
      { offerNextIfSlot: jest.fn().mockResolvedValue(undefined) } as never,
    );

    await service.cancelSession('session-1');
    expect(prisma.classSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { status: 'CANCELLED' },
    });
    expect(cancelCascade.apply).toHaveBeenCalledWith('session-1');
  });
});

type SessionUpdateCall = {
  where: { id: string };
  data: { capacity?: number; status: ClassSessionStatus };
};

describe('ClassesSessionsAdminService.updateSession capacity', () => {
  const existing = {
    id: 'session-1',
    classTypeId: 'ct-1',
    coachId: 'coach-1',
    startsAt: new Date('2026-10-08T13:00:00.000Z'),
    endsAt: new Date('2026-10-08T13:50:00.000Z'),
    status: 'FULL',
    capacity: 1,
    recurrencePattern: 'NONE',
    recurrenceWeekdays: [],
    recurrenceEndsAt: null,
    recurrenceCount: null,
  };

  function buildService(bookedCount: number) {
    const offerNextIfSlot = jest.fn().mockResolvedValue(undefined);
    const update = jest
      .fn<Promise<void>, [SessionUpdateCall]>()
      .mockResolvedValue(undefined);
    const prisma = {
      classSession: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce({
            ...existing,
            capacity: 10,
            _count: { bookings: bookedCount },
          }),
        update,
      },
      booking: { count: jest.fn().mockResolvedValue(bookedCount) },
      coachProfile: {
        findUnique: jest.fn().mockResolvedValue({
          assignedClassTypeIds: ['ct-1'],
          isActive: true,
        }),
      },
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      {
        assertClassTypeExists: jest.fn().mockResolvedValue(undefined),
      } as never,
      {
        invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
      } as never,
      { emitPublicScheduleSession: jest.fn() } as never,
      { apply: jest.fn() } as never,
      {
        finishPastClassSessions: jest.fn(),
        onSessionFinished: jest.fn(),
      } as never,
      { offerNextIfSlot } as never,
    );
    return { service, update, offerNextIfSlot };
  }

  it('reopens FULL when the edited capacity is above the booked count', async () => {
    const { service, update, offerNextIfSlot } = buildService(1);

    await service.updateSession('session-1', {
      capacity: 10,
      status: ClassSessionStatus.FULL,
    });

    const saved = update.mock.calls[0]?.[0];
    expect(saved?.where).toEqual({ id: 'session-1' });
    expect(saved?.data.capacity).toBe(10);
    expect(saved?.data.status).toBe(ClassSessionStatus.ACTIVE);
    expect(offerNextIfSlot).toHaveBeenCalledWith('session-1');
  });
});
