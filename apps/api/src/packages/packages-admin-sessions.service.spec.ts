import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, UserPackageStatus } from '@prisma/client';
import { ADMIN_SESSION_ADJUST_ERROR } from './packages-admin-sessions.constants';
import { PackagesAdminSessionsService } from './packages-admin-sessions.service';

const ACTOR = { id: 'admin-1', role: Role.ADMIN };

function createPackage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pkg-1',
    userId: 'user-1',
    status: UserPackageStatus.ACTIVE,
    planNameSnapshot: '8 Classes',
    planIsUnlimitedSnapshot: false,
    sessionsTotal: 8,
    sessionsRemaining: 0,
    balances: [
      {
        id: 'bal-1',
        isUnlimited: false,
        sessionsTotal: 8,
        sessionsRemaining: 0,
        sourceCategoryNameSnapshot: 'Reformer Group',
      },
    ],
    user: { id: 'user-1', role: Role.USER },
    ...overrides,
  };
}

function createService() {
  const tx = {
    userPackageBalance: { update: jest.fn() },
    userPackage: { update: jest.fn() },
    clientNote: { create: jest.fn() },
  };
  const prisma = {
    userPackage: { findUnique: jest.fn() },
    $transaction: jest.fn(async (callback: (value: typeof tx) => Promise<void>) =>
      callback(tx),
    ),
  };
  const audit = { log: jest.fn().mockResolvedValue(undefined) };
  const service = new PackagesAdminSessionsService(prisma as never, audit as never);
  return { service, prisma, tx, audit };
}

describe('PackagesAdminSessionsService', () => {
  it('adds complimentary sessions and writes a client note', async () => {
    const { service, prisma, tx, audit } = createService();
    prisma.userPackage.findUnique.mockResolvedValue(createPackage());

    const result = await service.adjustSessions(ACTOR, 'pkg-1', {
      sessions: 1,
      reason: 'Force majeure — studio error',
    });

    expect(tx.userPackageBalance.update).toHaveBeenCalledWith({
      where: { id: 'bal-1' },
      data: { sessionsRemaining: 1, sessionsTotal: 9 },
    });
    expect(tx.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: { sessionsRemaining: 1, sessionsTotal: 9 },
    });
    expect(tx.clientNote.create).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CLIENT_PACKAGE_SESSIONS_ADDED' }),
    );
    expect(result).toEqual({
      id: 'pkg-1',
      sessionsAdded: 1,
      sessionsRemaining: 1,
      sessionsTotal: 9,
    });
  });

  it('rejects unlimited packages', async () => {
    const { service, prisma } = createService();
    prisma.userPackage.findUnique.mockResolvedValue(
      createPackage({
        planIsUnlimitedSnapshot: true,
        sessionsRemaining: null,
      }),
    );

    await expect(
      service.adjustSessions(ACTOR, 'pkg-1', {
        sessions: 1,
        reason: 'Complimentary',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing packages', async () => {
    const { service, prisma } = createService();
    prisma.userPackage.findUnique.mockResolvedValue(null);

    await expect(
      service.adjustSessions(ACTOR, 'pkg-missing', {
        sessions: 1,
        reason: 'Complimentary',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('requires a balance when several limited types exist', async () => {
    const { service, prisma } = createService();
    prisma.userPackage.findUnique.mockResolvedValue(
      createPackage({
        balances: [
          {
            id: 'bal-1',
            isUnlimited: false,
            sessionsTotal: 4,
            sessionsRemaining: 1,
            sourceCategoryNameSnapshot: 'Reformer Group',
          },
          {
            id: 'bal-2',
            isUnlimited: false,
            sessionsTotal: 4,
            sessionsRemaining: 2,
            sourceCategoryNameSnapshot: 'Mat Pilates',
          },
        ],
      }),
    );

    await expect(
      service.adjustSessions(ACTOR, 'pkg-1', {
        sessions: 1,
        reason: 'Force majeure',
      }),
    ).rejects.toMatchObject({ message: ADMIN_SESSION_ADJUST_ERROR.BALANCE_REQUIRED });
  });
});
