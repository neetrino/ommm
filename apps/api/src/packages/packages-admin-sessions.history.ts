import { PrismaService } from '../prisma/prisma.service';
import { CLIENT_PACKAGE_SESSIONS_ADDED_ACTION } from './packages-admin-sessions.constants';
import { formatSessionAdjustmentActorName } from './packages-admin-sessions.helpers';

export type LastSessionAdjustmentDto = {
  sessionsAdded: number;
  reason: string;
  actorName: string;
  at: string;
};

type AuditRow = {
  entityId: string;
  actorId: string | null;
  payload: string | null;
  createdAt: Date;
};

export function parseSessionAdjustmentPayload(payload: string | null): {
  sessionsAdded: number;
  reason: string;
  actorName: string;
} | null {
  if (payload === null || payload.trim() === '') {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    const row = parsed as Record<string, unknown>;
    if (typeof row.sessionsAdded !== 'number' || typeof row.reason !== 'string') {
      return null;
    }
    return {
      sessionsAdded: row.sessionsAdded,
      reason: row.reason,
      actorName: typeof row.actorName === 'string' ? row.actorName : '',
    };
  } catch {
    return null;
  }
}

export async function loadLatestSessionAdjustments(
  prisma: PrismaService,
  packageIds: readonly string[],
): Promise<ReadonlyMap<string, LastSessionAdjustmentDto>> {
  if (packageIds.length === 0) {
    return new Map();
  }
  const logs = await prisma.auditLog.findMany({
    where: {
      action: CLIENT_PACKAGE_SESSIONS_ADDED_ACTION,
      entityType: 'UserPackage',
      entityId: { in: [...packageIds] },
    },
    select: {
      entityId: true,
      actorId: true,
      payload: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return resolveLatestAdjustments(prisma, logs);
}

async function resolveLatestAdjustments(
  prisma: PrismaService,
  logs: AuditRow[],
): Promise<ReadonlyMap<string, LastSessionAdjustmentDto>> {
  const latest = new Map<string, AuditRow>();
  for (const row of logs) {
    if (!latest.has(row.entityId)) {
      latest.set(row.entityId, row);
    }
  }
  const actorIds = [...new Set(
    [...latest.values()]
      .filter((row) => (parseSessionAdjustmentPayload(row.payload)?.actorName ?? '') === '')
      .map((row) => row.actorId)
      .filter((id): id is string => id !== null),
  )];
  const actors =
    actorIds.length === 0
      ? []
      : await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, lastName: true, email: true },
        });
  const actorNameById = new Map(
    actors.map((actor) => [actor.id, formatSessionAdjustmentActorName(actor)]),
  );
  const result = new Map<string, LastSessionAdjustmentDto>();
  for (const [packageId, row] of latest) {
    const parsed = parseSessionAdjustmentPayload(row.payload);
    if (parsed === null) {
      continue;
    }
    const actorName =
      parsed.actorName.trim() !== ''
        ? parsed.actorName.trim()
        : (row.actorId !== null ? actorNameById.get(row.actorId) : undefined) ??
          'Staff';
    result.set(packageId, {
      sessionsAdded: parsed.sessionsAdded,
      reason: parsed.reason,
      actorName,
      at: row.createdAt.toISOString(),
    });
  }
  return result;
}
