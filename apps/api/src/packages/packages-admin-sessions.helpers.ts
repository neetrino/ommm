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

export function formatSessionAdjustmentActorName(params: {
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const full = [params.name?.trim(), params.lastName?.trim()]
    .filter((part) => part !== undefined && part.length > 0)
    .join(' ')
    .trim();
  if (full.length > 0) {
    return full;
  }
  const email = params.email?.trim() ?? '';
  return email.length > 0 ? email : 'Staff';
}

export function buildSessionAdjustmentNote(params: {
  actorName: string;
  sessions: number;
  packageName: string;
  classTypeName: string;
  reason: string;
}): string {
  const typeLabel =
    params.classTypeName.trim() === ''
      ? 'package'
      : params.classTypeName.trim();
  return `${params.actorName} added ${params.sessions} ${typeLabel} session(s) to "${params.packageName}". Reason: ${params.reason}`;
}
