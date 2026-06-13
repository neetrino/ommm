import { buildPlanDeletionBlockedMessage } from './package-plan-deletion.util';

describe('buildPlanDeletionBlockedMessage', () => {
  it('uses singular copy for one blocking membership', () => {
    expect(buildPlanDeletionBlockedMessage(1)).toContain('1 member');
  });

  it('uses plural copy for multiple blocking memberships', () => {
    expect(buildPlanDeletionBlockedMessage(3)).toContain('3 members');
  });
});
