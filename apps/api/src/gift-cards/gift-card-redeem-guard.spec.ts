import { BadRequestException } from '@nestjs/common';
import {
  GIFT_REDEEM_MAX_FAILURES,
  assertRedeemAllowed,
  isRedeemBlocked,
  registerRedeemFailure,
} from './gift-card-redeem-guard';

describe('gift-card-redeem-guard', () => {
  const start = new Date('2026-09-28T10:00:00.000Z');

  it('blocks after the failure budget inside the window', () => {
    let state = registerRedeemFailure(undefined, start);
    for (let i = 1; i < GIFT_REDEEM_MAX_FAILURES; i += 1) {
      state = registerRedeemFailure(state, start);
    }
    expect(isRedeemBlocked(state, start)).toBe(true);
    expect(() => assertRedeemAllowed(state, start)).toThrow(BadRequestException);
  });

  it('opens a new window after the lock expires', () => {
    let state = registerRedeemFailure(undefined, start);
    for (let i = 1; i < GIFT_REDEEM_MAX_FAILURES; i += 1) {
      state = registerRedeemFailure(state, start);
    }
    const later = new Date(start.getTime() + 15 * 60 * 1000);
    expect(isRedeemBlocked(state, later)).toBe(false);
    expect(registerRedeemFailure(state, later)).toEqual({
      failures: 1,
      windowStartedAt: later.getTime(),
    });
  });
});
