import { ClassSessionStatus } from '@prisma/client';

/** New classes start bookable. Lifecycle statuses are never copied. */
export const CREATED_CLASS_SESSION_STATUS = ClassSessionStatus.ACTIVE;

const ALLOWED_CREATE_STATUSES = new Set<ClassSessionStatus>([
  ClassSessionStatus.ACTIVE,
  ClassSessionStatus.DRAFT,
]);

/**
 * Create/duplicate/batch may keep ACTIVE or DRAFT.
 * FINISHED, FULL, and CANCELLED from a source class become ACTIVE.
 */
export function resolveCreatedSessionStatus(
  status: ClassSessionStatus | undefined,
): ClassSessionStatus {
  if (status !== undefined && ALLOWED_CREATE_STATUSES.has(status)) {
    return status;
  }
  return CREATED_CLASS_SESSION_STATUS;
}
