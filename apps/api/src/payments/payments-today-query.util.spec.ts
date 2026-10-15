import { PaymentStatus } from '@prisma/client';
import { clampPaymentsQueryToToday } from './payments-today-query.util';

describe('clampPaymentsQueryToToday', () => {
  it('overrides caller dates with the studio day and keeps other filters', () => {
    const result = clampPaymentsQueryToToday(
      {
        from: '2020-01-01',
        to: '2030-12-31',
        status: [PaymentStatus.SUCCEEDED],
        q: 'anna',
        take: 25,
      },
      new Date('2026-10-14T21:30:00.000Z'),
    );

    expect(result).toEqual({
      from: '2026-10-15',
      to: '2026-10-15',
      status: [PaymentStatus.SUCCEEDED],
      q: 'anna',
      take: 25,
    });
  });
});
