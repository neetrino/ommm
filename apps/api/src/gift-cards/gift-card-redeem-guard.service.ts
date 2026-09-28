import { Injectable } from '@nestjs/common';
import {
  assertRedeemAllowed,
  registerRedeemFailure,
  type RedeemAttemptState,
} from './gift-card-redeem-guard';

@Injectable()
export class GiftCardRedeemGuardService {
  private readonly attempts = new Map<string, RedeemAttemptState>();

  assertAllowed(userId: string, now = new Date()): void {
    assertRedeemAllowed(this.attempts.get(userId), now);
  }

  recordFailure(userId: string, now = new Date()): void {
    this.attempts.set(
      userId,
      registerRedeemFailure(this.attempts.get(userId), now),
    );
  }

  recordSuccess(userId: string): void {
    this.attempts.delete(userId);
  }
}
