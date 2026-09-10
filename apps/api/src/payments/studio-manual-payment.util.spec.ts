import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import {
  canSwapStudioPaymentMethod,
  isAllowedCardStatusTransition,
  isAllowedStudioStatusTransition,
  isStudioManualPaymentMethod,
} from './studio-manual-payment.util';

describe('studio-manual-payment.util', () => {
  it('recognizes cash and terminal as studio methods', () => {
    expect(isStudioManualPaymentMethod(ManualPaymentMethod.CASH)).toBe(true);
    expect(isStudioManualPaymentMethod(ManualPaymentMethod.CARD_TERMINAL)).toBe(
      true,
    );
    expect(isStudioManualPaymentMethod(ManualPaymentMethod.CARD)).toBe(false);
    expect(isStudioManualPaymentMethod(ManualPaymentMethod.INFLUENCER)).toBe(
      false,
    );
    expect(canSwapStudioPaymentMethod(ManualPaymentMethod.CARD)).toBe(false);
  });

  it('allows card fail and refund without faking a bank deposit', () => {
    expect(
      isAllowedCardStatusTransition(PaymentStatus.PENDING, PaymentStatus.FAILED),
    ).toBe(true);
    expect(
      isAllowedCardStatusTransition(
        PaymentStatus.SUCCEEDED,
        PaymentStatus.REFUNDED,
      ),
    ).toBe(true);
    expect(
      isAllowedCardStatusTransition(
        PaymentStatus.SUCCEEDED,
        PaymentStatus.PENDING,
      ),
    ).toBe(false);
    expect(
      isAllowedCardStatusTransition(
        PaymentStatus.PENDING,
        PaymentStatus.SUCCEEDED,
      ),
    ).toBe(false);
  });

  it('locks studio payments after fail or refund and blocks fake success', () => {
    expect(
      isAllowedStudioStatusTransition(
        PaymentStatus.PENDING,
        PaymentStatus.SUCCEEDED,
      ),
    ).toBe(true);
    expect(
      isAllowedStudioStatusTransition(
        PaymentStatus.SUCCEEDED,
        PaymentStatus.PENDING,
      ),
    ).toBe(true);
    expect(
      isAllowedStudioStatusTransition(
        PaymentStatus.FAILED,
        PaymentStatus.SUCCEEDED,
      ),
    ).toBe(false);
    expect(
      isAllowedStudioStatusTransition(
        PaymentStatus.REFUNDED,
        PaymentStatus.PENDING,
      ),
    ).toBe(false);
    expect(
      isAllowedStudioStatusTransition(
        PaymentStatus.SUCCEEDED,
        PaymentStatus.FAILED,
      ),
    ).toBe(false);
  });
});
