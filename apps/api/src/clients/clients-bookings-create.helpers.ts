import { ClassSessionStatus } from '@prisma/client';

const BLOCKED_ADMIN_ASSIGN_STATUSES: ReadonlySet<ClassSessionStatus> = new Set([
  ClassSessionStatus.CANCELLED,
  ClassSessionStatus.DRAFT,
]);

export function canAdminAssignVisitorToSessionStatus(
  status: ClassSessionStatus,
): boolean {
  return !BLOCKED_ADMIN_ASSIGN_STATUSES.has(status);
}
