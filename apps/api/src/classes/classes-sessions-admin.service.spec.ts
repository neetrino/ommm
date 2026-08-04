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
