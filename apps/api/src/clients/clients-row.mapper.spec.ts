import { ManualPaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { INFLUENCER_PAYMENT_METHOD } from '../payments/payment-revenue.util';
import { toClientRow, type ClientRecord } from './clients-row.mapper';

function payment(overrides: {
  status: PaymentStatus;
  paymentMethod: ManualPaymentMethod | null;
  amountCents: number;
}) {
  return {
    id: 'pay-1',
    status: overrides.status,
    paymentMethod: overrides.paymentMethod,
    amountCents: overrides.amountCents,
  };
}

function record(payments: ReturnType<typeof payment>[]): ClientRecord {
  return {
    id: 'user-1',
    email: 'ada@example.com',
    name: 'Ada',
    lastName: 'Lovelace',
    phone: null,
    dateOfBirth: null,
    avatarUrl: null,
    createdAt: new Date('2020-01-01T00:00:00.000Z'),
    isBlocked: false,
    role: Role.USER,
    bookings: [],
    payments,
    giftCardsPurchased: [],
    giftCardsReceived: [],
    userPackages: [],
    clientNotesReceived: [],
    _count: { clientNotesReceived: 0 },
  } as unknown as ClientRecord;
}

describe('toClientRow influencer comps', () => {
  it('tags influencer clients and keeps catalog cost out of LTV and paid status', () => {
    const row = toClientRow(
      record([
        payment({
          status: PaymentStatus.SUCCEEDED,
          paymentMethod: INFLUENCER_PAYMENT_METHOD,
          amountCents: 120_000,
        }),
      ]),
    );

    expect(row.tags).toContain('Influencer');
    expect(row.lifetimeValueCents).toBe(0);
    expect(row.paymentBehavior).toBe('unpaid');
  });

  it('keeps the influencer tag after a later cash purchase and counts only cash toward LTV', () => {
    const row = toClientRow(
      record([
        payment({
          status: PaymentStatus.SUCCEEDED,
          paymentMethod: INFLUENCER_PAYMENT_METHOD,
          amountCents: 120_000,
        }),
        payment({
          status: PaymentStatus.SUCCEEDED,
          paymentMethod: ManualPaymentMethod.CASH,
          amountCents: 40_000,
        }),
      ]),
    );

    expect(row.tags).toContain('Influencer');
    expect(row.lifetimeValueCents).toBe(40_000);
    expect(row.paymentBehavior).toBe('paid');
  });
});
