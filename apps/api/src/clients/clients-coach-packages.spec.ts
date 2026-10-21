import { toCoachClientPackageItem } from './clients-coach-packages';

describe('toCoachClientPackageItem', () => {
  it('keeps the package summary and drops payment fields', () => {
    expect(
      toCoachClientPackageItem({
        id: 'pkg-1',
        status: 'ACTIVE',
        packageName: '1 Class',
        categoryName: 'Group Reformer',
        activationDate: '2026-10-20T00:00:00.000Z',
        expirationDate: '2026-11-19T00:00:00.000Z',
        awaitingFirstVisit: true,
        activationDeadline: '2026-11-19T00:00:00.000Z',
        totalSessions: 1,
        usedSessions: 0,
        remainingSessions: 1,
        isUnlimited: false,
        paymentId: 'pay-1',
        paymentAmountCents: 1500000,
        paymentMethod: 'ONLINE_CARD',
      }),
    ).toEqual({
      id: 'pkg-1',
      status: 'ACTIVE',
      packageName: '1 Class',
      categoryName: 'Group Reformer',
      activationDate: '2026-10-20T00:00:00.000Z',
      expirationDate: '2026-11-19T00:00:00.000Z',
      awaitingFirstVisit: true,
      activationDeadline: '2026-11-19T00:00:00.000Z',
      totalSessions: 1,
      usedSessions: 0,
      remainingSessions: 1,
      isUnlimited: false,
    });
  });
});
