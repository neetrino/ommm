import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';
import { CASH_PENDING_EMAIL_SUBJECT } from '../mail/templates/payment-cash-pending-customer.template';
import { PaymentCashPendingEmailService } from './payment-cash-pending-email.service';

describe('PaymentCashPendingEmailService', () => {
  function createService() {
    const prisma = {
      payment: {
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      studioSettings: {
        findFirst: jest.fn().mockResolvedValue({
          studioName: 'Ommm',
          address: 'Yerevan, Armenia',
          contactPhone: '+374 00 000 000',
          workingHours: 'Mon–Sat 09:00–21:00',
        }),
      },
    };
    const mail = { sendEmail: jest.fn().mockResolvedValue(undefined) };

    return {
      service: new PaymentCashPendingEmailService(
        prisma as never,
        mail as never,
        { trySendToUser: jest.fn().mockResolvedValue('skipped') } as never,
      ),
      prisma,
      mail,
    };
  }

  it('sends a cash pending reminder for pending cash payments', async () => {
    const { service, prisma, mail } = createService();
    prisma.payment.findUnique.mockResolvedValue({
      id: 'p1',
      userId: 'user-1',
      amountCents: 20_000,
      currency: 'amd',
      status: PaymentStatus.PENDING,
      source: PaymentSource.PACKAGE,
      paymentReference: 'PKG-CASH-1',
      paymentMethod: ManualPaymentMethod.CASH,
      cashPendingEmailSentAt: null,
      user: {
        email: 'customer@studio.test',
        name: 'Anna',
        lastName: 'Guest',
      },
    });

    await service.trySendCashPendingEmail('p1');

    expect(mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(mail.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@studio.test',
        subject: CASH_PENDING_EMAIL_SUBJECT,
      }),
    );
  });

  it('skips when cash pending email was already sent', async () => {
    const { service, prisma, mail } = createService();
    prisma.payment.findUnique.mockResolvedValue({
      id: 'p1',
      paymentMethod: ManualPaymentMethod.CASH,
      status: PaymentStatus.PENDING,
      cashPendingEmailSentAt: new Date(),
      user: { email: 'customer@studio.test', name: null, lastName: null },
    });

    await service.trySendCashPendingEmail('p1');

    expect(mail.sendEmail).not.toHaveBeenCalled();
  });
});
