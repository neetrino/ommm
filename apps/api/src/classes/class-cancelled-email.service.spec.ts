import { BookingStatus, WaitlistStatus } from '@prisma/client';
import { ClassCancelledEmailService } from './class-cancelled-email.service';

type SendEmailArg = { to: string; subject: string; html: string };

describe('ClassCancelledEmailService', () => {
  function createService() {
    const prisma = {
      classSession: { findUnique: jest.fn() },
      booking: { findMany: jest.fn() },
      waitlistEntry: { findMany: jest.fn() },
    };
    const mail = {
      sendEmail: jest.fn((payload: SendEmailArg) => {
        void payload;
        return Promise.resolve();
      }),
    };
    return {
      service: new ClassCancelledEmailService(
        prisma as never,
        mail as never,
        { trySendToUser: jest.fn().mockResolvedValue('skipped') } as never,
      ),
      prisma,
      mail,
    };
  }

  function bookedUser(id: string, email: string) {
    return { user: { id, email, locale: 'en' } };
  }

  it('emails booked members and open waitlist once', async () => {
    const { service, prisma, mail } = createService();
    prisma.classSession.findUnique.mockResolvedValue({
      startsAt: new Date('2026-08-20T06:00:00.000Z'),
      classType: { name: 'Yoga Flow' },
    });
    prisma.booking.findMany.mockResolvedValue([
      bookedUser('user-1', 'booked@studio.test'),
      bookedUser('user-2', 'both@studio.test'),
    ]);
    prisma.waitlistEntry.findMany.mockResolvedValue([
      bookedUser('user-2', 'both@studio.test'),
      bookedUser('user-3', 'waitlist@studio.test'),
    ]);

    await service.notifySessionCancelled('session-1');

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId: 'session-1', status: BookingStatus.BOOKED },
      }),
    );
    expect(prisma.waitlistEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sessionId: 'session-1',
          status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
        },
      }),
    );
    expect(mail.sendEmail).toHaveBeenCalledTimes(3);
    expect(mail.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'booked@studio.test',
        subject: 'Your class was cancelled — Yoga Flow',
      }),
    );
    const html = mail.sendEmail.mock.calls[0]?.[0].html;
    expect(html).toContain('Open schedule');
    expect(html).toContain('Yoga Flow');
  });

  it('skips sending when the session is missing', async () => {
    const { service, prisma, mail } = createService();
    prisma.classSession.findUnique.mockResolvedValue(null);

    await service.notifySessionCancelled('missing');

    expect(prisma.booking.findMany).not.toHaveBeenCalled();
    expect(mail.sendEmail).not.toHaveBeenCalled();
  });

  it('does not throw when a recipient send fails', async () => {
    const { service, prisma, mail } = createService();
    prisma.classSession.findUnique.mockResolvedValue({
      startsAt: new Date('2026-08-20T06:00:00.000Z'),
      classType: { name: 'Yoga Flow' },
    });
    prisma.booking.findMany.mockResolvedValue([
      bookedUser('user-1', 'booked@studio.test'),
    ]);
    prisma.waitlistEntry.findMany.mockResolvedValue([]);
    mail.sendEmail.mockRejectedValue(new Error('resend down'));

    await expect(
      service.notifySessionCancelled('session-1'),
    ).resolves.toBeUndefined();
  });
});
