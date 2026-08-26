import { Role } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export type StaffActivityScope =
  | { kind: 'studio' }
  | { kind: 'coach'; coachProfileId: string }
  | { kind: 'empty' };

export type StaffActivityActor = {
  id: string;
  role: Role;
};

export function isCoachStaffActivityActor(role: Role): boolean {
  return role === Role.COACH;
}

/** Inbox owner is the coach teaching that session (substitute if assigned). */
export function resolveSessionInboxCoachId(session: {
  coachId: string;
  substituteCoachId: string | null;
}): string {
  return session.substituteCoachId ?? session.coachId;
}

export function visibilityWhereForScope(
  scope: StaffActivityScope,
): Prisma.StaffActivityNotificationWhereInput {
  if (scope.kind === 'empty') {
    return { id: { in: [] } };
  }
  if (scope.kind === 'coach') {
    return { coachProfileId: scope.coachProfileId };
  }
  return {};
}

export function unreadWhereForScope(
  scope: StaffActivityScope,
): Prisma.StaffActivityNotificationWhereInput {
  if (scope.kind === 'empty') {
    return { id: { in: [] } };
  }
  if (scope.kind === 'coach') {
    return { coachProfileId: scope.coachProfileId, coachReadAt: null };
  }
  return { staffReadAt: null };
}

export function markReadDataForScope(
  scope: StaffActivityScope,
): Prisma.StaffActivityNotificationUpdateManyMutationInput {
  if (scope.kind === 'coach') {
    return { coachReadAt: new Date() };
  }
  return { staffReadAt: new Date() };
}

export function isStaffActivityUnread(
  row: { staffReadAt: Date | null; coachReadAt: Date | null },
  scope: StaffActivityScope,
): boolean {
  if (scope.kind === 'coach') {
    return row.coachReadAt === null;
  }
  if (scope.kind === 'empty') {
    return false;
  }
  return row.staffReadAt === null;
}
