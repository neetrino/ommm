import { ClientRegistrationSource, Role } from '@prisma/client';
import {
  inviteRegistrationFields,
  isClientInviteCode,
  isClientInviteStaffRole,
  newClientInviteCode,
} from './client-invite-code';

describe('client invite codes', () => {
  it('issues a url-safe code', () => {
    expect(isClientInviteCode(newClientInviteCode())).toBe(true);
  });

  it('rejects empty and oversized codes', () => {
    expect(isClientInviteCode(undefined)).toBe(false);
    expect(isClientInviteCode('short')).toBe(false);
    expect(isClientInviteCode('has space!!')).toBe(false);
  });

  it('limits invite links to admin and manager', () => {
    expect(isClientInviteStaffRole(Role.ADMIN)).toBe(true);
    expect(isClientInviteStaffRole(Role.MANAGER)).toBe(true);
    expect(isClientInviteStaffRole(Role.COACH)).toBe(false);
    expect(isClientInviteStaffRole(Role.USER)).toBe(false);
  });

  it('keeps organic signup unattributed', () => {
    expect(inviteRegistrationFields(null)).toEqual({
      registrationSource: ClientRegistrationSource.SELF,
    });
  });

  it('attributes a valid referrer as an invite', () => {
    expect(inviteRegistrationFields('staff-1')).toEqual({
      registrationSource: ClientRegistrationSource.INVITE,
      registeredById: 'staff-1',
    });
  });
});
