export type AdjustablePackageBalance = {
  id: string;
  isUnlimited: boolean;
  sessionsTotal: number | null;
  sessionsRemaining: number | null;
  sourceCategoryNameSnapshot: string;
};

export function isLimitedBalance(balance: AdjustablePackageBalance): boolean {
  return !balance.isUnlimited && balance.sessionsRemaining !== null;
}

export function resolveAdjustableBalance(
  balances: readonly AdjustablePackageBalance[],
  requestedId: string | undefined,
): AdjustablePackageBalance | null {
  const limited = balances.filter(isLimitedBalance);
  if (requestedId !== undefined && requestedId.trim() !== '') {
    return limited.find((balance) => balance.id === requestedId) ?? null;
  }
  if (limited.length === 1) {
    return limited[0] ?? null;
  }
  return null;
}

export function nextLimitedSessionCounts(params: {
  sessionsTotal: number | null;
  sessionsRemaining: number | null;
  add: number;
}): { sessionsTotal: number; sessionsRemaining: number } {
  const remaining = params.sessionsRemaining ?? 0;
  const total = params.sessionsTotal ?? remaining;
  return {
    sessionsRemaining: remaining + params.add,
    sessionsTotal: total + params.add,
  };
}

export function buildSessionAdjustmentNote(params: {
  sessions: number;
  packageName: string;
  classTypeName: string;
  reason: string;
}): string {
  const typeLabel =
    params.classTypeName.trim() === '' ? 'package' : params.classTypeName.trim();
  return `Added ${params.sessions} ${typeLabel} session(s) to "${params.packageName}". Reason: ${params.reason}`;
}
