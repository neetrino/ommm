import { BadRequestException } from '@nestjs/common';

export const GIFT_REDEEM_MAX_FAILURES = 8;
export const GIFT_REDEEM_WINDOW_MS = 15 * 60 * 1000;

export type RedeemAttemptState = {
  failures: number;
  windowStartedAt: number;
};

export function registerRedeemFailure(
  state: RedeemAttemptState | undefined,
  now: Date,
): RedeemAttemptState {
  if (state === undefined || now.getTime() - state.windowStartedAt >= GIFT_REDEEM_WINDOW_MS) {
    return { failures: 1, windowStartedAt: now.getTime() };
  }
  return { failures: state.failures + 1, windowStartedAt: state.windowStartedAt };
}

export function isRedeemBlocked(state: RedeemAttemptState | undefined, now: Date): boolean {
  if (state === undefined) {
    return false;
  }
  if (now.getTime() - state.windowStartedAt >= GIFT_REDEEM_WINDOW_MS) {
    return false;
  }
  return state.failures >= GIFT_REDEEM_MAX_FAILURES;
}

export function assertRedeemAllowed(state: RedeemAttemptState | undefined, now: Date): void {
  if (isRedeemBlocked(state, now)) {
    throw new BadRequestException('Too many gift code attempts. Try again later.');
  }
}
