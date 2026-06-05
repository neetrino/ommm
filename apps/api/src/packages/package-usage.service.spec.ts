import { BadRequestException } from '@nestjs/common';
import { PackageStatus } from '@prisma/client';
import { PackageUsageService } from './package-usage.service';

describe('PackageUsageService', () => {
  const service = new PackageUsageService({} as never);

  describe('computeUsageStats', () => {
    it('returns null counts for unlimited plans', () => {
      expect(
        service.computeUsageStats({
          sessionsTotal: null,
          sessionsRemaining: null,
          plan: { isUnlimited: true, sessionsPerMonth: null },
        }),
      ).toEqual({
        totalSessions: null,
        usedSessions: null,
        remainingSessions: null,
        isUnlimited: true,
      });
    });

    it('derives used sessions from total and remaining', () => {
      expect(
        service.computeUsageStats({
          sessionsTotal: 12,
          sessionsRemaining: 8,
          plan: { isUnlimited: false, sessionsPerMonth: 12 },
        }),
      ).toEqual({
        totalSessions: 12,
        usedSessions: 4,
        remainingSessions: 8,
        isUnlimited: false,
      });
    });

    it('never returns negative used sessions', () => {
      expect(
        service.computeUsageStats({
          sessionsTotal: 8,
          sessionsRemaining: 10,
          plan: { isUnlimited: false, sessionsPerMonth: 8 },
        }).usedSessions,
      ).toBe(0);
    });
  });

  describe('consumeSession', () => {
    it('decrements remaining when sessions are available', async () => {
      const updateMany = jest.fn().mockResolvedValue({ count: 1 });
      const tx = {
        userPackage: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pkg-1',
            status: PackageStatus.ACTIVE,
            plan: { isUnlimited: false },
          }),
          updateMany,
        },
      };

      await service.consumeSession(tx as never, 'pkg-1');

      expect(updateMany).toHaveBeenCalledWith({
        where: {
          id: 'pkg-1',
          status: PackageStatus.ACTIVE,
          sessionsRemaining: { gt: 0 },
        },
        data: { sessionsRemaining: { decrement: 1 } },
      });
    });

    it('throws when no sessions remain', async () => {
      const tx = {
        userPackage: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pkg-1',
            status: PackageStatus.ACTIVE,
            plan: { isUnlimited: false },
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      await expect(
        service.consumeSession(tx as never, 'pkg-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('restoreSession', () => {
    it('increments remaining when below total', async () => {
      const update = jest.fn();
      const tx = {
        userPackage: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pkg-1',
            sessionsTotal: 12,
            sessionsRemaining: 8,
            plan: { isUnlimited: false },
          }),
          update,
        },
      };

      await service.restoreSession(tx as never, 'pkg-1');

      expect(update).toHaveBeenCalledWith({
        where: { id: 'pkg-1' },
        data: { sessionsRemaining: { increment: 1 } },
      });
    });

    it('does not restore when already at total', async () => {
      const update = jest.fn();
      const tx = {
        userPackage: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pkg-1',
            sessionsTotal: 12,
            sessionsRemaining: 12,
            plan: { isUnlimited: false },
          }),
          update,
        },
      };

      await service.restoreSession(tx as never, 'pkg-1');

      expect(update).not.toHaveBeenCalled();
    });
  });
});
