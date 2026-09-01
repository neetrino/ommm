import {
  buildSessionAdjustmentNote,
  nextLimitedSessionCounts,
  resolveAdjustableBalance,
} from './packages-admin-sessions.helpers';

const reformer = {
  id: 'bal-1',
  isUnlimited: false,
  sessionsTotal: 8,
  sessionsRemaining: 2,
  sourceCategoryNameSnapshot: 'Reformer Group',
};
const mat = {
  id: 'bal-2',
  isUnlimited: false,
  sessionsTotal: 4,
  sessionsRemaining: 1,
  sourceCategoryNameSnapshot: 'Mat Pilates',
};

describe('packages-admin-sessions.helpers', () => {
  it('picks the only limited balance when no id is given', () => {
    expect(resolveAdjustableBalance([reformer], undefined)?.id).toBe('bal-1');
  });

  it('returns null when several limited balances have no id', () => {
    expect(resolveAdjustableBalance([reformer, mat], undefined)).toBeNull();
  });

  it('increments remaining and total together', () => {
    expect(
      nextLimitedSessionCounts({
        sessionsTotal: 8,
        sessionsRemaining: 0,
        add: 2,
      }),
    ).toEqual({ sessionsTotal: 10, sessionsRemaining: 2 });
  });

  it('builds an audit note with the reason', () => {
    expect(
      buildSessionAdjustmentNote({
        sessions: 1,
        packageName: '8 Classes',
        classTypeName: 'Reformer Group',
        reason: 'Force majeure',
      }),
    ).toContain('Force majeure');
  });
});
