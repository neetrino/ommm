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

const CLOSED_ACCOUNT_EMAIL_DOMAIN = 'users.invalid';

/** Self-closed member. Staff archives stay locked to the same email. */
export function isSelfClosedAccount(user: {
  id: string;
  deletedAt: Date | null;
  deletedById?: string | null;
}): boolean {
  return user.deletedAt !== null && user.deletedById === user.id;
}

export function retiredAccountEmail(userId: string): string {
  return `closed+${userId}@${CLOSED_ACCOUNT_EMAIL_DOMAIN}`;
}

/** Frees a self-closed login so the same email can register again. */
export async function releaseSelfClosedAccount(
  store: {
    $transaction: (
      fn: (tx: Prisma.TransactionClient) => Promise<void>,
    ) => Promise<void>;
  },
  user: {
    id: string;
    deletedAt: Date | null;
    deletedById?: string | null;
  },
): Promise<boolean> {
  if (!isSelfClosedAccount(user)) {
    return false;
  }
  await store.$transaction((tx) => releaseClosedSignInIdentity(tx, user.id));
  return true;
}

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
  if (params.actorId === params.userId) {
    await releaseClosedSignInIdentity(tx, user.id);
  }
}

/**
 * Keeps the archived row and its history, but frees the email, phone, and
 * Google id so the person can open a new account.
 */
export async function releaseClosedSignInIdentity(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  const accounts = await tx.oAuthAccount.findMany({
    where: { userId },
    select: { id: true, providerAccountId: true },
  });
  for (const account of accounts) {
    if (account.providerAccountId.startsWith('closed:')) {
      continue;
    }
    await tx.oAuthAccount.update({
      where: { id: account.id },
      data: { providerAccountId: `closed:${account.id}` },
    });
  }
  const retiredEmail = retiredAccountEmail(userId);
  const current = await tx.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (current === null || current.email === retiredEmail) {
    return;
  }
  await tx.user.update({
    where: { id: userId },
    data: {
      email: retiredEmail,
      phone: null,
      whatsappPhone: null,
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
