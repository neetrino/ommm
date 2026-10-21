import type { Prisma } from '@prisma/client';

export type AuditLogWrite = {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  payload?: unknown;
};

type AuditLogDb = {
  auditLog: {
    create: (args: Prisma.AuditLogCreateArgs) => Promise<unknown>;
  };
};

/** Writes a journal row and throws if the insert fails. Call inside the same transaction as the change. */
export async function writeAuditLog(
  db: AuditLogDb,
  params: AuditLogWrite,
): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      payload:
        params.payload === undefined ? null : JSON.stringify(params.payload),
    },
  });
}
