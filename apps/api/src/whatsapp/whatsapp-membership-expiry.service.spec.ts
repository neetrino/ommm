import { UserPackageStatus } from '@prisma/client';
import { ENABLE_BACKGROUND_REMINDERS_ENV } from '../notifications/notifications-audit.constants';
import { WhatsappMembershipExpiryService } from './whatsapp-membership-expiry.service';

const NOW = '2026-09-21T15:00:00.000Z';

describe('WhatsappMembershipExpiryService', () => {
  const originalFlag = process.env[ENABLE_BACKGROUND_REMINDERS_ENV];

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFlag === undefined) {
      delete process.env[ENABLE_BACKGROUND_REMINDERS_ENV];
      return;
    }
    process.env[ENABLE_BACKGROUND_REMINDERS_ENV] = originalFlag;
  });

  function createService(enabled: boolean) {
    process.env[ENABLE_BACKGROUND_REMINDERS_ENV] = enabled ? 'true' : 'false';
    const prisma = {
      userPackage: { findMany: jest.fn().mockResolvedValue([]) },
      membershipExpiryReminderSendLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };
    const notify = {
      isConfigured: jest.fn().mockResolvedValue(true),
      trySendToUser: jest.fn().mockResolvedValue('sent'),
    };
    const service = new WhatsappMembershipExpiryService(
      prisma as never,
      notify as never,
    );
    return { service, prisma, notify };
  }

  function duePackage() {
    return {
      id: 'pkg-1',
      userId: 'user-1',
      planNameSnapshot: '8 sessions',
      currentPeriodEnd: new Date('2026-09-28T15:10:00.000Z'),
      user: { locale: 'en' },
    };
  }

  it('does not query packages when reminders are disabled', async () => {
    const { service, prisma, notify } = createService(false);
    await service.sendDueReminders();
    expect(prisma.userPackage.findMany).not.toHaveBeenCalled();
    expect(notify.isConfigured).not.toHaveBeenCalled();
  });

  it('queries the week and day windows for unused active packages only', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse(NOW));
    const { service, prisma } = createService(true);
    await service.sendDueReminders();
    expect(prisma.userPackage.findMany).toHaveBeenCalledTimes(2);
    const windows = prisma.userPackage.findMany.mock.calls.map(
      ([args]: [
        {
          where: {
            status: UserPackageStatus;
            removedAt: null;
            currentPeriodEnd: { gte: Date; lte: Date };
            consumptions: { none: { restoredAt: null } };
            expiryReminderLogs: { none: { daysBefore: number } };
          };
        },
      ]) => ({
        from: args.where.currentPeriodEnd.gte.toISOString(),
        to: args.where.currentPeriodEnd.lte.toISOString(),
        status: args.where.status,
        removedAt: args.where.removedAt,
        consumptions: args.where.consumptions,
        daysBefore: args.where.expiryReminderLogs.none.daysBefore,
      }),
    );
    expect(windows).toEqual([
      {
        from: '2026-09-28T15:00:00.000Z',
        to: '2026-09-28T15:35:00.000Z',
        status: UserPackageStatus.ACTIVE,
        removedAt: null,
        consumptions: { none: { restoredAt: null } },
        daysBefore: 7,
      },
      {
        from: '2026-09-22T15:00:00.000Z',
        to: '2026-09-22T15:35:00.000Z',
        status: UserPackageStatus.ACTIVE,
        removedAt: null,
        consumptions: { none: { restoredAt: null } },
        daysBefore: 1,
      },
    ]);
  });

  it('sends once for a due unused package and records that window', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse(NOW));
    const { service, prisma, notify } = createService(true);
    prisma.userPackage.findMany
      .mockResolvedValueOnce([duePackage()])
      .mockResolvedValueOnce([]);
    await service.sendDueReminders();
    expect(notify.trySendToUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        topic: 'bookingReminders',
        idempotencyKey: 'omm-wa-expiry-pkg-1-7',
      }),
    );
    expect(prisma.membershipExpiryReminderSendLog.create).toHaveBeenCalledWith({
      data: { userPackageId: 'pkg-1', daysBefore: 7 },
    });
  });

  it('does not record a send when WhatsApp did not accept the message', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse(NOW));
    const { service, prisma, notify } = createService(true);
    notify.trySendToUser.mockResolvedValue('failed');
    prisma.userPackage.findMany.mockResolvedValueOnce([duePackage()]);
    await service.sendDueReminders();
    expect(
      prisma.membershipExpiryReminderSendLog.create,
    ).not.toHaveBeenCalled();
  });
});
