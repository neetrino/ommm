import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService.deleteOwnAccount', () => {
  const homeImage = {} as never;

  function makeService(prismaMock: object): UsersService {
    return new UsersService(prismaMock as never, homeImage);
  }

  it('archives the account and keeps the row', async () => {
    const tx = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'ada@example.com',
          phone: null,
          whatsappPhone: null,
          name: 'Ada',
          lastName: null,
          role: Role.USER,
          deletedAt: null,
        }),
        update: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      coachProfile: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
      oAuthAccount: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
    };
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ role: Role.USER }),
        delete: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (client: typeof tx) => Promise<void>) => callback(tx),
      ),
    };
    const service = makeService(prisma);

    await service.deleteOwnAccount('user-1');

    expect(prisma.user.delete).not.toHaveBeenCalled();
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({
        isBlocked: true,
        deletedById: 'user-1',
      }) as { isBlocked: boolean; deletedById: string },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        email: 'closed+user-1@users.invalid',
        phone: null,
        whatsappPhone: null,
      },
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          actorId: 'user-1',
          actorRole: Role.USER,
          action: 'ACCOUNT_ARCHIVED',
          entityType: 'User',
          entityId: 'user-1',
          payload: JSON.stringify({
            email: 'ada@example.com',
            phone: null,
            whatsappPhone: null,
            name: 'Ada',
            lastName: null,
            role: Role.USER,
          }),
        },
      }),
    );
  });

  it('rejects coach self-archival', async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ role: Role.COACH }),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const service = makeService(prisma);

    await expect(service.deleteOwnAccount('coach-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
