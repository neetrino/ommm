import { BadRequestException } from '@nestjs/common';
import {
  assertCustomGiftAmount,
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from './payments-checkout.helpers';

describe('assertCustomGiftAmount', () => {
  it('accepts the minimum amount', () => {
    expect(() =>
      assertCustomGiftAmount(CUSTOM_GIFT_CARD_MIN_AMD),
    ).not.toThrow();
  });

  it('rejects an amount below the minimum', () => {
    expect(() => assertCustomGiftAmount(CUSTOM_GIFT_CARD_MIN_AMD - 1)).toThrow(
      BadRequestException,
    );
  });

  it('rejects an amount above the safety cap', () => {
    expect(() => assertCustomGiftAmount(CUSTOM_GIFT_CARD_MAX_AMD + 1)).toThrow(
      BadRequestException,
    );
  });

  it('rejects a fractional amount', () => {
    expect(() =>
      assertCustomGiftAmount(CUSTOM_GIFT_CARD_MIN_AMD + 0.5),
    ).toThrow(BadRequestException);
  });
});
