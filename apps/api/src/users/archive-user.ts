import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

const ARCHIVE_USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  whatsappPhone: true,
  name: true,
  lastName: true,
  role: true,
  deletedAt: true,
} as const;

type ArchiveActor = {
  userId: string;
  actorId: string;
  actorRole: string;
  action: string;
};

/** Blocks sign-in and keeps every related row. A second call is a no-op. */
export async function archiveUser(
  tx: Prisma.TransactionClient,
  params: ArchiveActor,
): Promise<void> {
  const user = await tx.user.findUnique({
    where: { id: params.userId },
    select: ARCHIVE_USER_SELECT,
  });
  if (user === null) {
    throw new NotFoundException('Account not found');
  }
  if (user.deletedAt !== null) {
    return;
  }
  await tx.user.update({
    where: { id: user.id },
    data: {
      deletedAt: new Date(),
      deletedById: params.actorId,
      isBlocked: true,
    },
  });
  await tx.coachProfile.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });
  await tx.auditLog.create({
    data: {
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      entityType: 'User',
      entityId: user.id,
      payload: JSON.stringify({
        email: user.email,
        phone: user.phone,
        whatsappPhone: user.whatsappPhone,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      }),
    },
  });
}

/** Clears the archive flag and leaves the account blocked until staff activate it. */
export async function restoreArchivedUser(
  tx: Prisma.TransactionClient,
  params: { userId: string; actorId: string; actorRole: string },
): Promise<void> {
  const user = await tx.user.findUnique({
    where: { id: params.userId },
    select: ARCHIVE_USER_SELECT,
  });
  if (user === null || user.deletedAt === null) {
    throw new NotFoundException('Archived account not found');
  }
  await tx.user.update({
    where: { id: user.id },
    data: { deletedAt: null, deletedById: null },
  });
  await tx.auditLog.create({
    data: {
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: 'CLIENT_RESTORED',
      entityType: 'User',
      entityId: user.id,
      payload: JSON.stringify({
        email: user.email,
        phone: user.phone,
        whatsappPhone: user.whatsappPhone,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      }),
    },
  });
}
