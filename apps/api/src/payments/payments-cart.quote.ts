import { planDropInGiftCharge } from './payments-dropin-gift';

export const CART_CHECKOUT_KIND = 'CART';

export type StudioCartQuoteInput = {
  packageCents: number;
  sessionCents: number;
  barCents: number;
  classSessionsAvailable: number;
  spendableGiftCents: number;
  useGiftCredits: boolean;
  hasSession: boolean;
  couponDiscountCents?: number;
};

export type StudioCartQuote = {
  classSessionsCovered: number;
  sessionChargeCents: number;
  moneyTotalCents: number;
  appliedGiftCents: number;
  chargeCents: number;
};

/** Class credit covers one matching session. Money gift covers the remainder. */
export function quoteStudioCart(input: StudioCartQuoteInput): StudioCartQuote {
  const covered =
    input.hasSession &&
    input.sessionCents > 0 &&
    input.classSessionsAvailable >= 1;
  const sessionChargeCents = covered ? 0 : input.sessionCents;
  const moneyTotalCents =
    input.packageCents + sessionChargeCents + input.barCents;
  const couponDiscountCents = Math.min(
    moneyTotalCents,
    Math.max(0, input.couponDiscountCents ?? 0),
  );
  const gift = planDropInGiftCharge({
    priceCents: moneyTotalCents - couponDiscountCents,
    spendableCents: input.spendableGiftCents,
    useGiftCredits: input.useGiftCredits,
  });
  return {
    classSessionsCovered: covered ? 1 : 0,
    sessionChargeCents,
    moneyTotalCents,
    appliedGiftCents: gift.appliedCents,
    chargeCents: gift.chargeCents,
  };
}
