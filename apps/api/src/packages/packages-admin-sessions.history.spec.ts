import { parseSessionAdjustmentPayload } from './packages-admin-sessions.history';

describe('parseSessionAdjustmentPayload', () => {
  it('reads sessions, reason and actor name', () => {
    expect(
      parseSessionAdjustmentPayload(
        JSON.stringify({
          sessionsAdded: 2,
          reason: 'Force majeure',
          actorName: 'Gurgen Ginosyan',
        }),
      ),
    ).toEqual({
      sessionsAdded: 2,
      reason: 'Force majeure',
      actorName: 'Gurgen Ginosyan',
    });
  });

  it('returns null for invalid payload', () => {
    expect(parseSessionAdjustmentPayload('not-json')).toBeNull();
    expect(parseSessionAdjustmentPayload(null)).toBeNull();
  });
});
