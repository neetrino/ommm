import { Injectable } from '@nestjs/common';
import {
  assertRedeemAllowed,
  GIFT_REDEEM_BURST,
  registerRedeemFailure,
  type RedeemAttemptState,
} from './gift-card-redeem-guard';

@Injectable()
export class GiftCardRedeemGuardService {
  private readonly attempts = new Map<string, RedeemAttemptState>();
  private readonly redeems = new Map<string, RedeemAttemptState>();

  assertAllowed(userId: string, now = new Date()): void {
    assertRedeemAllowed(this.attempts.get(userId), now);
  }

  recordFailure(userId: string, now = new Date()): RedeemAttemptState {
    const next = registerRedeemFailure(this.attempts.get(userId), now);
    this.attempts.set(userId, next);
    return next;
  }

  recordSuccess(userId: string, now = new Date()): boolean {
    this.attempts.delete(userId);
    const next = registerRedeemFailure(this.redeems.get(userId), now);
    this.redeems.set(userId, next);
    return next.failures === GIFT_REDEEM_BURST;
  }
}
