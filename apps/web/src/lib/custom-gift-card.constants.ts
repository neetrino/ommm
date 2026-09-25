/**
 * Whole AMD. Keep in sync with `CUSTOM_GIFT_CARD_MIN_AMD` /
 * `CUSTOM_GIFT_CARD_MAX_AMD` in `apps/api/src/payments/payments-checkout.helpers.ts`.
 */
export const CUSTOM_GIFT_CARD_MIN_AMD = 30_000;

/** Safety cap for a member-chosen gift amount. */
export const CUSTOM_GIFT_CARD_MAX_AMD = 1_000_000;

export const CUSTOM_GIFT_MESSAGE_MAX_LENGTH = 400;
