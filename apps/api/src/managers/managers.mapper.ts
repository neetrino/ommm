import type { ManagerDirectoryRow, ManagerUserRecord } from './managers.types';

export const managerListSelect = {
  id: true,
  email: true,
  name: true,
  lastName: true,
  phone: true,
  isBlocked: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Maps a manager user row to the admin directory DTO (never exposes password hash). */
export function toManagerDirectoryRow(
  user: ManagerUserRecord,
  actorId: string,
): ManagerDirectoryRow {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    phone: user.phone,
    isBlocked: user.isBlocked,
    invitePending: user.passwordHash === null,
    isSelf: user.id === actorId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
