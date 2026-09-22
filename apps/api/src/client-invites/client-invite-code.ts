import { randomBytes } from 'node:crypto';
import { ClientRegistrationSource, Role } from '@prisma/client';

/** 9 bytes → 12 unpadded base64url characters. */
const CLIENT_INVITE_CODE_BYTES = 9;

const CLIENT_INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]{8,24}$/;

export function newClientInviteCode(): string {
  return randomBytes(CLIENT_INVITE_CODE_BYTES).toString('base64url');
}

export function isClientInviteCode(value: string | undefined): value is string {
  return typeof value === 'string' && CLIENT_INVITE_CODE_PATTERN.test(value);
}

export function isClientInviteStaffRole(role: Role): boolean {
  return role === Role.ADMIN || role === Role.MANAGER;
}

/** Self-serve signup fields. A missing referrer stays a normal SELF registration. */
export function inviteRegistrationFields(referrerId: string | null): {
  registrationSource: ClientRegistrationSource;
  registeredById?: string;
} {
  if (referrerId === null) {
    return { registrationSource: ClientRegistrationSource.SELF };
  }
  return {
    registrationSource: ClientRegistrationSource.INVITE,
    registeredById: referrerId,
  };
}
