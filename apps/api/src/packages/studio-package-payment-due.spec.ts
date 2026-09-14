import { BookingStatus } from '@prisma/client';
import {
  isStudioUnpaidPayment,
  loadStudioPackagePaymentDueIds,
  studioPackagePaymentDueCutoff,
} from './studio-package-payment-due';

describe('studio-package-payment-due', () => {
  it('cuts off one hour after class end', () => {
    const now = new Date('2026-09-14T15:00:00.000Z');
    expect(studioPackagePaymentDueCutoff(now).toISOString()).toBe(
      '2026-09-14T14:00:00.000Z',
    );
  });

  it('treats only pending cash or terminal as unpaid studio payments', () => {
    expect(
      isStudioUnpaidPayment({
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
      }),
    ).toBe(true);
    expect(
      isStudioUnpaidPayment({
        paymentStatus: 'PENDING',
        paymentMethod: 'CARD_TERMINAL',
      }),
    ).toBe(true);
    expect(
      isStudioUnpaidPayment({
        paymentStatus: 'SUCCEEDED',
        paymentMethod: 'CASH',
      }),
    ).toBe(false);
  });

  it('returns packages whose consumed class ended at least one hour ago', async () => {
    const findMany = jest.fn().mockResolvedValue([{ userPackageId: 'up-due' }]);
    const ids = await loadStudioPackagePaymentDueIds(
      { bookingConsumption: { findMany } },
      ['up-due', 'up-fresh'],
      new Date('2026-09-14T15:00:00.000Z'),
    );

    expect(ids).toEqual(new Set(['up-due']));
    expect(findMany).toHaveBeenCalledWith({
      where: {
        userPackageId: { in: ['up-due', 'up-fresh'] },
        restoredAt: null,
        booking: {
          status: { in: [BookingStatus.BOOKED, BookingStatus.COMPLETED] },
          session: { endsAt: { lte: new Date('2026-09-14T14:00:00.000Z') } },
        },
      },
      select: { userPackageId: true },
    });
  });
});
