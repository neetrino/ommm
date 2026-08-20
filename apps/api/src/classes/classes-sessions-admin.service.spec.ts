import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassesSessionsAdminService } from './classes-sessions-admin.service';

type SessionCounts = { bookings: number; waitlistEntries: number };

describe('ClassesSessionsAdminService.deleteSession', () => {
  const schedule = {
    invalidatePublicCache: jest.fn().mockResolvedValue(undefined),
  };
  const realtime = {
    emitPublicScheduleSession: jest.fn(),
  };

  function buildService(counts: SessionCounts | null) {
    const deleteFn = jest.fn().mockResolvedValue(undefined);
    const findUnique = jest
      .fn()
      .mockResolvedValue(counts === null ? null : { _count: counts });
    const prisma = {
      classSession: { findUnique, delete: deleteFn },
    };
    const service = new ClassesSessionsAdminService(
      prisma as never,
      {} as never,
      schedule as never,
      realtime as never,
      {} as never,
      { finishPastClassSessions: jest.fn().mockResolvedValue(0) } as never,
    );
    return { service, deleteFn };
  }

  it('rejects deletion when the session has bookings', async () => {
    const { service, deleteFn } = buildService({
      bookings: 2,
      waitlistEntries: 0,
    });

    await expect(service.deleteSession('session-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it('rejects deletion when the session has waitlist entries', async () => {
    const { service, deleteFn } = buildService({
      bookings: 0,
      waitlistEntries: 1,
    });

    await expect(service.deleteSession('session-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it('deletes when there are no bookings or waitlist entries', async () => {
    const { service, deleteFn } = buildService({
      bookings: 0,
      waitlistEntries: 0,
    });

    await service.deleteSession('session-1');

    expect(deleteFn).toHaveBeenCalledWith({ where: { id: 'session-1' } });
    expect(schedule.invalidatePublicCache).toHaveBeenCalled();
    expect(realtime.emitPublicScheduleSession).toHaveBeenCalledWith(
      'session-1',
    );
  });

  it('throws NotFoundException when the session does not exist', async () => {
    const { service, deleteFn } = buildService(null);

    await expect(service.deleteSession('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(deleteFn).not.toHaveBeenCalled();
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
      { finishPastClassSessions: jest.fn().mockResolvedValue(0) } as never,
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
      { finishPastClassSessions: jest.fn().mockResolvedValue(0) } as never,
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
      { finishPastClassSessions: jest.fn().mockResolvedValue(0) } as never,
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
      { finishPastClassSessions: jest.fn().mockResolvedValue(0) } as never,
    );

    await service.cancelSession('session-1');
    expect(prisma.classSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { status: 'CANCELLED' },
    });
    expect(cancelCascade.apply).toHaveBeenCalledWith('session-1');
  });
});
