import {
  didRedeemJustLock,
  GIFT_REDEEM_MAX_FAILURES,
  registerRedeemFailure,
} from './gift-card-redeem-guard';

describe('didRedeemJustLock', () => {
  it('is true only on the failure that reaches the lock', () => {
    let state = registerRedeemFailure(undefined, new Date());
    for (let attempt = 1; attempt < GIFT_REDEEM_MAX_FAILURES; attempt += 1) {
      expect(didRedeemJustLock(state)).toBe(false);
      state = registerRedeemFailure(state, new Date());
    }
    expect(state.failures).toBe(GIFT_REDEEM_MAX_FAILURES);
    expect(didRedeemJustLock(state)).toBe(true);
  });
});
