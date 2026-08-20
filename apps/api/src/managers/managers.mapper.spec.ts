import { toManagerDirectoryRow } from './managers.mapper';
import type { ManagerUserRecord } from './managers.types';

function user(overrides: Partial<ManagerUserRecord> = {}): ManagerUserRecord {
  return {
    id: 'mgr_1',
    email: 'manager@ommm.local',
    name: 'Gor',
    lastName: 'Mkrtchyan',
    phone: '+37441111111',
    isBlocked: false,
    passwordHash: 'hashed',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

describe('toManagerDirectoryRow', () => {
  it('marks invite pending when password is not set', () => {
    const row = toManagerDirectoryRow(user({ passwordHash: null }), 'admin_1');
    expect(row.invitePending).toBe(true);
    expect(row.isSelf).toBe(false);
  });

  it('flags the signed-in manager as self', () => {
    const row = toManagerDirectoryRow(user(), 'mgr_1');
    expect(row.isSelf).toBe(true);
    expect(row.invitePending).toBe(false);
  });

  it('serializes timestamps as ISO strings', () => {
    const row = toManagerDirectoryRow(user(), 'admin_1');
    expect(row.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(row.updatedAt).toBe('2026-01-02T00:00:00.000Z');
  });
});
