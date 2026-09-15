import 'reflect-metadata';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { PaymentSourceFilter } from './dto/admin-list-payments-query.dto';
import { buildAdminListPaymentsWhere } from './payments-admin-list.util';

describe('buildAdminListPaymentsWhere', () => {
  it('filters by cash, terminal, card, or influencer payment method', () => {
    expect(
      buildAdminListPaymentsWhere({
        paymentMethod: [ManualPaymentMethod.CASH],
      }),
    ).toEqual({ paymentMethod: ManualPaymentMethod.CASH });
    expect(
      buildAdminListPaymentsWhere({
        paymentMethod: [ManualPaymentMethod.CARD_TERMINAL],
      }),
    ).toEqual({ paymentMethod: ManualPaymentMethod.CARD_TERMINAL });
    expect(
      buildAdminListPaymentsWhere({
        paymentMethod: [ManualPaymentMethod.CARD],
      }),
    ).toEqual({ paymentMethod: ManualPaymentMethod.CARD });
    expect(
      buildAdminListPaymentsWhere({
        paymentMethod: [ManualPaymentMethod.INFLUENCER],
      }),
    ).toEqual({ paymentMethod: ManualPaymentMethod.INFLUENCER });
  });

  it('keeps payment method together with status and source', () => {
    const where = buildAdminListPaymentsWhere({
      status: [PaymentStatus.SUCCEEDED],
      source: [PaymentSourceFilter.PACKAGE],
      paymentMethod: [ManualPaymentMethod.CASH],
    });

    expect(where.status).toBe(PaymentStatus.SUCCEEDED);
    expect(where.paymentMethod).toBe(ManualPaymentMethod.CASH);
    expect(where).toMatchObject({ source: 'PACKAGE' });
  });

  it('applies package source id restriction when provided', () => {
    const where = buildAdminListPaymentsWhere(
      { status: [PaymentStatus.SUCCEEDED] },
      {
        packageSourceWhere: {
          source: 'PACKAGE',
          sourceId: { in: ['up-1', 'up-2'] },
        },
      },
    );
    expect(where).toMatchObject({
      status: PaymentStatus.SUCCEEDED,
      source: 'PACKAGE',
      sourceId: { in: ['up-1', 'up-2'] },
    });
  });
});
