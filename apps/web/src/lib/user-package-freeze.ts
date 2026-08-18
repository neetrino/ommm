export type UserPackageFreezeState = {
  allowedCount: number;
  maxDaysPerUse: number;
  usedCount: number;
  remainingCount: number;
  pausedAt: string | null;
  pausedUntil: string | null;
  canFreeze: boolean;
  canUnfreeze: boolean;
};

export const EMPTY_USER_PACKAGE_FREEZE: UserPackageFreezeState = {
  allowedCount: 0,
  maxDaysPerUse: 0,
  usedCount: 0,
  remainingCount: 0,
  pausedAt: null,
  pausedUntil: null,
  canFreeze: false,
  canUnfreeze: false,
};

function readCount(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function readTimestamp(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function normalizeUserPackageFreeze(raw: unknown): UserPackageFreezeState {
  if (typeof raw !== "object" || raw === null) {
    return EMPTY_USER_PACKAGE_FREEZE;
  }
  const row = raw as Record<string, unknown>;
  const allowedCount = readCount(row.allowedCount);
  const maxDaysPerUse = readCount(row.maxDaysPerUse);
  const usedCount = readCount(row.usedCount);
  const remainingCount = readCount(row.remainingCount);
  return {
    allowedCount,
    maxDaysPerUse,
    usedCount,
    remainingCount,
    pausedAt: readTimestamp(row.pausedAt),
    pausedUntil: readTimestamp(row.pausedUntil),
    canFreeze: row.canFreeze === true,
    canUnfreeze: row.canUnfreeze === true,
  };
}
