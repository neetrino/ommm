import { mapClientPackageTypeBalances } from './clients-package-type-balances.util';

describe('mapClientPackageTypeBalances', () => {
  it('returns empty when fewer than two balances', () => {
    expect(
      mapClientPackageTypeBalances([
        {
          id: 'b1',
          sourceCategoryNameSnapshot: 'Yoga',
          sessionsTotal: 12,
          sessionsUsed: 3,
          sessionsRemaining: 9,
          isUnlimited: false,
          classType: { name: 'Yoga' },
        },
      ]),
    ).toEqual([]);
  });

  it('maps used totals and sorts by class type name', () => {
    const rows = mapClientPackageTypeBalances([
      {
        id: 'b-yoga',
        sourceCategoryNameSnapshot: 'Yoga',
        sessionsTotal: 4,
        sessionsUsed: 1,
        sessionsRemaining: 3,
        isUnlimited: false,
        classType: { name: 'Yoga' },
      },
      {
        id: 'b-mat',
        sourceCategoryNameSnapshot: 'Mat',
        sessionsTotal: 4,
        sessionsUsed: 2,
        sessionsRemaining: 2,
        isUnlimited: false,
        classType: { name: 'Mat Pilates' },
      },
      {
        id: 'b-power',
        sourceCategoryNameSnapshot: 'Power',
        sessionsTotal: 4,
        sessionsUsed: 2,
        sessionsRemaining: 2,
        isUnlimited: false,
        classType: null,
      },
    ]);

    expect(rows.map((row) => row.classTypeName)).toEqual([
      'Mat Pilates',
      'Power',
      'Yoga',
    ]);
    expect(rows[0]).toMatchObject({
      usedSessions: 2,
      totalSessions: 4,
      remainingSessions: 2,
    });
  });
});
