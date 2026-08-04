const TYPE_BALANCE_MIN_ROWS = 2;

export type ClientPackageTypeBalanceItem = {
  id: string;
  classTypeName: string;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

type ClientPackageBalanceSource = {
  id: string;
  sourceCategoryNameSnapshot: string;
  sessionsTotal: number | null;
  sessionsUsed: number;
  sessionsRemaining: number | null;
  isUnlimited: boolean;
  classType: { name: string } | null;
};

/** Maps multi-type package balances for admin client package cards. */
export function mapClientPackageTypeBalances(
  balances: ReadonlyArray<ClientPackageBalanceSource>,
): ClientPackageTypeBalanceItem[] {
  if (balances.length < TYPE_BALANCE_MIN_ROWS) {
    return [];
  }
  return [...balances]
    .map((balance) => {
      const classTypeName =
        balance.classType?.name.trim() ||
        balance.sourceCategoryNameSnapshot.trim() ||
        '—';
      const usedSessions = balance.isUnlimited
        ? balance.sessionsUsed
        : balance.sessionsTotal === null || balance.sessionsRemaining === null
          ? balance.sessionsUsed
          : Math.max(balance.sessionsTotal - balance.sessionsRemaining, 0);
      return {
        id: balance.id,
        classTypeName,
        totalSessions: balance.sessionsTotal,
        usedSessions,
        remainingSessions: balance.sessionsRemaining,
        isUnlimited: balance.isUnlimited,
      };
    })
    .sort((left, right) =>
      left.classTypeName.localeCompare(right.classTypeName, undefined, {
        sensitivity: 'base',
      }),
    );
}
