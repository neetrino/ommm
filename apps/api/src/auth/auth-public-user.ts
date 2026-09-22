import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash' | 'clientInviteCode'> & {
  hasPassword: boolean;
};

/** Public user payload. Invite codes stay off login and profile responses. */
export function sanitizeUser(user: User): SafeUser {
  const { passwordHash, clientInviteCode, ...rest } = user;
  void passwordHash;
  void clientInviteCode;
  return {
    ...rest,
    hasPassword: passwordHash !== null,
  };
}
