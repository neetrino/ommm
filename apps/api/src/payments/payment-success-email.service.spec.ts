import { PaymentSource, PaymentStatus } from '@prisma/client';
import { PaymentSuccessEmailService } from './payment-success-email.service';

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

type SendEmailMock = jest.Mock<Promise<void>, [SendEmailParams]>;

function getSentHtml(
  sendEmail: SendEmailMock,
  recipient: string,
): string | undefined {
  return sendEmail.mock.calls.find(([payload]) => payload.to === recipient)?.[0]
    .html;
}

describe('PaymentSuccessEmailService', () => {
  function createService() {
    const prisma = {
      payment: {
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      classSession: {
        findUnique: jest.fn(),
      },
      giftCardBatch: {
        findUnique: jest.fn(),
      },
    };
    const mail = {
      sendEmail: jest.fn().mockResolvedValue(undefined) as SendEmailMock,
    };
    const config = {
      get: jest.fn((key: string) =>
        key === 'CONTACT_RECEIVER_EMAIL' ? 'admin@studio.test' : undefined,
      ),
    };

    return {
      service: new PaymentSuccessEmailService(
        prisma as never,
        mail as never,
        config as never,
      ),
      prisma,
      mail,
    };
  }

  it('skips when previous status was already SUCCEEDED', async () => {
    const { service, prisma, mail } = createService();

    await service.trySendSuccessEmails('p1', PaymentStatus.SUCCEEDED);

    expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    expect(mail.sendEmail).not.toHaveBeenCalled();
  });

  it('sends customer and admin emails on first success transition', async () => {
    const { service, prisma, mail } = createService();
    prisma.payment.findUnique.mockResolvedValue({
      id: 'p1',
      amountCents: 25_000,
      currency: 'amd',
      status: PaymentStatus.SUCCEEDED,
      source: PaymentSource.PACKAGE,
      sourceId: null,
      description: 'Package subscription',
      metadata: null,
      paymentReference: 'PKG-ABC123',
      confirmedAt: new Date('2026-06-11T12:00:00.000Z'),
      updatedAt: new Date('2026-06-11T12:00:00.000Z'),
      successEmailSentAt: null,
      user: {
        email: 'customer@studio.test',
        name: 'Anna',
        lastName: 'Guest',
        phone: '+37400000000',
      },
      plan: { name: 'Monthly Flow', categoryName: 'Yoga' },
      userPackage: null,
    });

    await service.trySendSuccessEmails('p1', PaymentStatus.PENDING);

    expect(mail.sendEmail).toHaveBeenCalledTimes(2);

    const customerHtml = getSentHtml(mail.sendEmail, 'customer@studio.test');
    const adminHtml = getSentHtml(mail.sendEmail, 'admin@studio.test');

    expect(customerHtml).toBeDefined();
    expect(customerHtml).not.toContain('Reference');
    expect(customerHtml).not.toContain('PKG-ABC123');
    expect(adminHtml).toBeDefined();
    expect(adminHtml).not.toContain('Reference');
    expect(adminHtml).not.toContain('Payment ID');
    expect(adminHtml).not.toContain('Related details');
    expect(adminHtml).not.toContain('PKG-ABC123');
    expect(prisma.payment.updateMany).toHaveBeenCalledTimes(1);
    const updateManyMock = prisma.payment.updateMany as jest.Mock<
      Promise<{ count: number }>,
      [
        {
          where: { id: string; successEmailSentAt: null };
          data: { successEmailSentAt: Date };
        },
      ]
    >;
    const updateCall = updateManyMock.mock.calls[0]?.[0];
    expect(updateCall?.where).toEqual({ id: 'p1', successEmailSentAt: null });
    expect(updateCall?.data.successEmailSentAt).toBeInstanceOf(Date);
  });

  it('does not mark sent when customer email fails', async () => {
    const { service, prisma, mail } = createService();
    prisma.payment.findUnique.mockResolvedValue({
      id: 'p1',
      amountCents: 10_000,
      currency: 'amd',
      status: PaymentStatus.SUCCEEDED,
      source: PaymentSource.DROPIN,
      sourceId: 's1',
      description: 'Drop-in',
      metadata: null,
      paymentReference: 'DROPIN-1',
      confirmedAt: new Date('2026-06-11T12:00:00.000Z'),
      updatedAt: new Date('2026-06-11T12:00:00.000Z'),
      successEmailSentAt: null,
      user: {
        email: 'customer@studio.test',
        name: 'Anna',
        lastName: null,
        phone: null,
      },
      plan: null,
      userPackage: null,
    });
    prisma.classSession.findUnique.mockResolvedValue({
      title: 'Morning Flow',
      startsAt: new Date('2026-06-12T08:00:00.000Z'),
      classType: { name: 'Yoga' },
    });
    mail.sendEmail.mockRejectedValueOnce(new Error('Resend unavailable'));

    await service.trySendSuccessEmails('p1', PaymentStatus.PENDING);

    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
  });
});
